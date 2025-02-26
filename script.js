const input = document.getElementById("input");
const preview = document.getElementById("preview");
const clearBtn = document.getElementById("clear");
const toggleModeBtn = document.getElementById("toggle-mode");
const runCodeBtn = document.getElementById("run-code");
const errorOutput = document.getElementById("error-output");
const stats = document.getElementById("stats");
const downloadBtn = document.getElementById("download");
const uploadBtn = document.getElementById("upload-btn");
const uploadInput = document.getElementById("upload");
const timer = document.getElementById("timer");
const resumeTimerBtn = document.getElementById("resume-timer");
const pauseTimerBtn = document.getElementById("pause-timer");
const resetTimerBtn = document.getElementById("reset-timer");
const lapContainer = document.getElementById("lap-list");
const lapBtn = document.getElementById("lap-timer");
const exportLapTimesBtn = document.getElementById("export-lap");
const fontSelect = document.getElementById("font-select");

let startTime = performance.now();
let elapsedTime = 0;
let isPaused = false;
let intervalId;

toggleModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("dark-mode", document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
});

clearBtn.addEventListener("click", () => {
    input.value = "";
    handleInput();
});

downloadBtn.addEventListener("click", () => {
    if (!input.value.trim()) {
        appendErrorMessage("Cannot download an empty file.");
        return;
    }

    const blob = new Blob([input.value], {
        type: "text/plain"
    }); // i have no idea what is a blob
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "tadi_lab.txt";

    document.body.appendChild(a); // apparently required
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url); // cleanup
});

uploadBtn.addEventListener("click", () => uploadInput.click());

uploadInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            input.value = e.target.result;
            handleInput();
        };
        reader.readAsText(file);
    }
});

lapBtn.addEventListener("click", recordLap);

exportLapTimesBtn.addEventListener("click", exportLapTimes);

resumeTimerBtn.addEventListener("click", resumeTimer);

pauseTimerBtn.addEventListener("click", pauseTimer);

resetTimerBtn.addEventListener("click", resetTimer);


input.addEventListener("keydown", (event) => {
    if (event.key === "(") {
        insertTextAtCursor("()");
        event.preventDefault();
    }

    if (event.key === "[") {
        insertTextAtCursor("[]");
        event.preventDefault();
    }

    if (event.key === "{") {
        insertTextAtCursor("{}");
        event.preventDefault();
    }

    if (event.key === "'") {
        insertTextAtCursor("''");
        event.preventDefault();
    }

    if (event.key === '"') {
        insertTextAtCursor('""');
        event.preventDefault();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "b") {
        insertTextAtCursor("****");
        input.selectionStart -= 2;
        event.preventDefault();
    }

    if (event.ctrlKey && event.key === "i") {
        insertTextAtCursor("**");
        input.selectionStart -= 1;
        event.preventDefault();
    }

    if (event.ctrlKey && event.key === "k") {
        insertTextAtCursor("[text](url)");
        input.selectionStart -= 4;
        event.preventDefault();
    }
})

fontSelect.addEventListener("change", function () {
    input.style.fontFamily = this.value;
});

input.addEventListener("input", handleInput);

runCodeBtn.addEventListener("click", () => {
    runJavaScript(); // works in browser
    runTidalCycles(); // works with Strudel
    
    if (window.languageConfigs) {
        window.languageConfigs.forEach(config => {
            runCode(config.language, config.compiler, config.flags);
        });
    }
});


input.value = localStorage.getItem("editor-content") || "# Welcome to Tadi Lab\n\nWrite **Markdown**, HTML, and JavaScript here.";
if (localStorage.getItem("dark-mode") === "enabled") {
    document.body.classList.add("dark-mode");
}

intervalId = setInterval(updateTimer, 1000);

async function main() {
    await initializeData(); // wait load
    handleInput(); // now start
}

// start
main();

// i was told to put async on top...

async function initializeData() {
    try {
        // load required JSON files
        window.iconMap = await loadJSON('/coding-tool/data/iconMap.json');
        window.allowedIframeSources = await loadJSON('/coding-tool/data/allowedIframeSources.json');
        window.languageConfigs = await loadJSON('/coding-tool/data/languageConfigs.json');
        
        console.log("Data Loaded Successfully", {
            iconMap,
            allowedIframeSources,
            languageConfigs
        });
    } catch (error) {
        appendErrorMessage(`Error loading JSON files:\n\nMessage: ${error.message}\nStack: ${error.stack}`);
        console.error("Error details:", error);
    }
}

async function loadJSON(url) {
  const response = await fetch(url);
  return response.json();
}

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // quotes are free
    .replace(/'/g, "&#039;");
}

function handleInput() {
    errorOutput.textContent = "";
    let content = input.value;
    
    content = escapeHTML(content); // don't put the raw chicken in the salad
    content = replaceIframes(replaceSliders(replaceLinks(replaceIcons(replaceTextInputs(replaceNumberInputs(replaceCheckboxes(replaceRadioButtons(replaceSelectDropdowns(replaceTextareas(content)))))))))); // way too long
    let parsedHTML = marked.parse(content);

    // you don't believe how many hours fixing this took
    parsedHTML = sanitizeLinks(parsedHTML);

    preview.innerHTML = parsedHTML;
    Prism.highlightAll();
    updateStats();
}

function sanitizeLinks(html) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    tempDiv.querySelectorAll("a").forEach(link => {
        try {
            const url = new URL(link.href);
            const allowed = [...allowedIframeSources].some(allowed => url.origin.startsWith(allowed));
            if (!allowed) {
                link.outerHTML = '<p style="color:red;">Invalid link</p>';
            }
        } catch (e) {
            link.outerHTML = '<p style="color:red;">Invalid link</p>';
        }
    });

    return tempDiv.innerHTML;
}


function insertTextAtCursor(text) {
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const before = input.value.substring(0, start);
  const after = input.value.substring(end);
  input.value = before + text + after;
  input.selectionStart = input.selectionEnd = start + text.length;
}

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function updateTimer() {
    if (!isPaused) {
        const currentTime = performance.now();
        elapsedTime = Math.floor((currentTime - startTime) / 1000);
        timer.textContent = `Time spent editing: ${formatTime(elapsedTime)}`;
    }
}

function pauseTimer() {
    isPaused = true;
    timer.style.color = "red";
    pauseTimerBtn.style.display = "none";
    resumeTimerBtn.style.display = "inherit"; // slippy mindset
}

function resumeTimer() {
    isPaused = false;
    startTime = performance.now() - elapsedTime * 1000;
    timer.style.color = "inherit";
    resumeTimerBtn.style.display = "none";
    pauseTimerBtn.style.display = "inherit";
}

function resetTimer() {
    startTime = performance.now();
    elapsedTime = 0;
    isPaused = false;
    timer.style.color = "inherit";
    timer.textContent = "Time spent editing: 00:00:00";
    lapContainer.innerHTML = ""; // this could be made a prompt
    resumeTimerBtn.style.display = "none";
    pauseTimerBtn.style.display = "inherit";
}

function recordLap() {
  const lapTime = document.createElement("li");
  lapTime.textContent = `Lap at: ${formatTime(elapsedTime)}`;
  lapContainer.appendChild(lapTime);
}

function exportLapTimes() {
  const lapTimes = Array.from(lapContainer.children).map((lap) => lap.textContent);
  const lapTimesText = lapTimes.join("\n");
  const blob = new Blob([lapTimesText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "lap_times.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function runJavaScript() {
    const codeBlocks = preview.querySelectorAll("code.language-js");
    codeBlocks.forEach((block) => {
        try {
            new Function(block.textContent)();
        } catch (e) {
            appendErrorMessage("JavaScript Error: " + e.message);
        }
    });
}

function runTidalCycles() {
    const codeBlocks = preview.querySelectorAll("code.language-tidalcycles");
    codeBlocks.forEach((block) => {
        try {
            const tidalCode = block.textContent;
            const base64Code = btoa(unescape(encodeURIComponent(tidalCode))); // Encode to Base64
            const iframe = document.createElement("iframe");
            iframe.src = `https://strudel.cc/#${base64Code}`;
            iframe.width = "100%";
            iframe.height = "400px";
            iframe.style.border = "none";
            // Append the iframe to the preview area
            block.replaceWith(iframe);
        } catch (e) {
            appendErrorMessage("TidalCycles Error: " + e.message);
        }
    });
}

function runCode(language, compilerId, options = "") {
    const codeBlocks = preview.querySelectorAll(`code.language-${language}`);
    
    codeBlocks.forEach((block) => {
        try {
            const userCode = block.textContent;

            const payload = {
                sessions: [{
                    id: 1,
                    language: language,
                    source: userCode,
                    compilers: [{
                        id: compilerId,
                        options: options
                    }]
                }]
            };

            const encodedCode = btoa(JSON.stringify(payload));
            const iframe = document.createElement("iframe");
            iframe.src = `https://${language}.compiler-explorer.com/clientstate/${encodedCode}`;
            iframe.width = "100%";
            iframe.height = "400px";
            block.replaceWith(iframe);
        } catch (e) {
            appendErrorMessage(`${language.charAt(0).toUpperCase() + language.slice(1)} Error: ` + e.message);
        }
    });
}


function updateStats() {
  const text = input.value.trim();
  const words = text ? text.match(/\b\w+\b/g)?.length || 0 : 0; // regex matches all full words of string
  const chars = text.length;
  stats.textContent = `Words: ${words} | Characters: ${chars}`;
}

function createSafeIframe(src) {
  try {
    const url = new URL(src);
    if (!allowedIframeSources.some(allowed => url.origin.startsWith(allowed))) {
      throw new Error("Iframe source not allowed.");
    }
    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.width = "100%";
    iframe.height = "400px";
    iframe.sandbox = "allow-scripts allow-same-origin allow-popups";
    return iframe;
  } catch (e) {
      appendErrorMessage("IFrame Error: " + e.message);
    return null;
  }
}

function createSafeHyperlink(src, text) {
    try {
        if (!/^https?:\/\//i.test(src)) {
            throw new Error("Invalid URL format.");
        } const url = new URL(src);
        if (![...allowedIframeSources].some(allowed => url.origin.startsWith(allowed))) {
            throw new Error("Link source not allowed.");
        }
        const link = document.createElement("a");
        link.href = url.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = text || url.href; // Use provided text or default to the URL
        return link;
    } catch (e) {
        appendErrorMessage("Link Error: " + e.message);
        return null;
    }
}

function replaceIframes(text) {
  return text.replace(/:iframe src="([^"]+)":/g, (match, url) => { // regex matches :iframe src="http(s)://www.url.tld":
    const iframe = createSafeIframe(url); // make iframe use "::" instead of "[]" is done
    return iframe ? iframe.outerHTML : '<p style="color:red;">Invalid iframe.</p>';
  });
}

function replaceIcons(text) {
  return text.replace(/:icon type="([^"]+)":/g, (match, type) => {
    return iconMap[type] || type;
  });
}

function replaceLinks(text) {
    return text.replace(/:link src="([^"]+)"(?: text="([^"]*)")?:/g, (match, url, linkText) => {
        const link = createSafeHyperlink(url.trim(), linkText ? linkText.trim() : null);
        return link ? link.outerHTML : '<p style="color:red;">Invalid link</p>'; });
}

function appendErrorMessage(message) {
    if (!errorOutput) return;
    const errorParagraph = document.createElement("p");
    errorParagraph.style.color = "red";
    errorParagraph.textContent = message;
    errorOutput.appendChild(errorParagraph);
}

function replaceSliders(text) {
    return text.replace(/:slider min="([^"]+)" max="([^"]+)" step="([^"]+)" value="([^"]+)":/g, (match, min, max, step, value) => {
            return `<input type="range" min="${min}" max="${max}" step="${step}" value="${value}" 
                    oninput="this.nextElementSibling.value = this.value">
                    <output>${value}</output>`;
    });
}

function replaceSelectDropdowns(text) {
    return text.replace(/:select name="([^"]+)" options="([^"]+)" selected="([^"]+)":/g, 
        (match, name, options, selected) => {
            const optionsHTML = options.split(', ').map(option => 
                `<option value="${option}"${option === selected ? ' selected' : ''}>${option}</option>`
            ).join('');
            return `<select name="${name}">${optionsHTML}</select>`;
        }
    );
}

function replaceRadioButtons(text) {
    return text.replace(/:radio name="([^"]+)" value="([^"]+)"( checked)?:/g, 
        (match, name, value, checked) => {
            return `<input type="radio" name="${name}" value="${value}"${checked ? ' checked' : ''}>`;
        }
    );
}

function replaceCheckboxes(text) {
    return text.replace(/:checkbox( checked)?:/g, 
        (match, checked) => {
            return `<input type="checkbox"${checked ? ' checked' : ''}>`;
        }
    );
}

function replaceNumberInputs(text) {
    return text.replace(/:number min="([^"]+)" max="([^"]+)" value="([^"]+)":/g, 
        (match, min, max, value) => {
            return `<input type="number" min="${min}" max="${max}" value="${value}">`;
        }
    );
}

function replaceTextInputs(text) {
    return text.replace(/:text placeholder="([^"]+)" value="([^"]+)":/g, 
        (match, placeholder, value) => {
            return `<input type="text" placeholder="${placeholder}" value="${value}">`;
        }
    );
}

function replaceTextareas(text) {
    return text.replace(/:textarea placeholder="([^"]+)" rows="(\d+)" cols="(\d+)":([^:]+):/g, 
        (match, placeholder, rows, cols, content) => {
            return `<textarea placeholder="${placeholder}" rows="${rows}" cols="${cols}">${content}</textarea>`;
        }
    );
}

function replaceSelectDropdowns(text) {
    return text.replace(/:select name="([^"]+)" options="([^"]+)" selected="([^"]+)":/g, 
        (match, name, options, selected) => {
            const optionsHTML = options.split(', ').map(option => 
                `<option value="${option}"${option === selected ? ' selected' : ''}>${option}</option>`
            ).join('');
            return `<select name="${name}">${optionsHTML}</select>`;
        }
    );
}
