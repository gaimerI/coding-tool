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
        alert("Cannot download an empty file.");
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

async function initializeData() {
    try {
        // Load required JSON files
        window.emojiMap = await loadJSON('/coding-tool/data/emojiMap.json');
        window.allowedIframeSources = await loadJSON('/coding-tool/data/allowedIframeSources.json');
        window.languageConfigs = await loadJSON('/coding-tool/data/languageConfigs.json');
        
        console.log("Data Loaded Successfully", {
            emojiMap,
            allowedIframeSources,
            languageConfigs
        });
    } catch (error) {
        alert("Error loading JSON files: " + error);
    }
}

async function loadJSON(url) {
  const response = await fetch(url);
  return response.json();
}

function handleInput() {
  // localStorage.setItem("editor-content", input.value); // commented out, find new way to reduce size
  const parsedMarkdown = marked.parse(replaceIframes(replaceEmojis(input.value))); // put emoji replacement before parsing and then iframes
  preview.innerHTML = parsedMarkdown;
  Prism.highlightAll();
  updateStats();
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
    errorOutput.textContent = "";
    const codeBlocks = preview.querySelectorAll("code.language-js");
    codeBlocks.forEach((block) => {
        try {
            new Function(block.textContent)();
        } catch (e) {
            errorOutput.textContent = "JavaScript Error: " + e.message;
        }
    });
}

function runTidalCycles() {
    errorOutput.textContent = "";
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
            errorOutput.textContent = "TidalCycles Error: " + e.message;
        }
    });
}

function runCode(language, compilerId, options = "") {
    errorOutput.textContent = "";
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
            errorOutput.textContent = `${language.charAt(0).toUpperCase() + language.slice(1)} Error: ` + e.message;
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
  errorOutput.textContent = "";
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
    errorOutput.textContent = "IFrame Error: " + e.message;
    return null;
  }
}

function replaceIframes(text) {
  return text.replace(/:iframe src="([^"]+)":/g, (match, url) => { // regex matches :iframe src="http(s)://www.url.tld":
    const iframe = createSafeIframe(url); // make iframe use "::" instead of "[]" is done
    return iframe ? iframe.outerHTML : '<p style="color:red;">Invalid or untrusted iframe source.</p>';
  });
}

function replaceEmojis(text) {
  return text.replace(/:\w+:/g, (match) => emojiMap[match] || match);
}
