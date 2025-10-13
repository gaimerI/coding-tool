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
const fileNameInput = document.getElementById("file-name");
const fileExtensionSelect = document.getElementById("file-extension");
const consoleToggleCheckbox = document.getElementById('console-toggle');
const editModeSelect = document.getElementById('edit-mode');
const hashGenButton = document.getElementById('hash-button');
const hashSpan = document.getElementById('file-hash');
let defaultFileName = "text";
let defaultFileExtension = "txt";

let startTime = performance.now();
let elapsedTime = 0;
let isPaused = false;
let intervalId;

hashGenButton.addEventListener("click", async function() {
    const enc = new TextEncoder();
    const encoding = 'hex';
    const algorithm = 'SHA-256';
    const data = enc.encode(input.value);
    const digest = await crypto.subtle.digest(algorithm, data);
    const bytes = new Uint8Array(digest);

    let result;
    
    if (encoding === 'hex') {
        result = Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join('');
    }
    
    if (encoding === 'base64') {
        result = btoa(String.fromCharCode(...bytes));
    }
    console.log(result);
    navigator.clipboard.writeText(result);
    hashSpan.textContent = `File hash: ${result}`;
})

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
        console.warn("Cannot download an empty file:" + input.value);
        return;
    }

    const content = input.value;
    const blob = new Blob([content], {
        type: "text/plain"
    });
    const url = URL.createObjectURL(blob);

    const defaultName = defaultFileName || "tadi_lab";
    const defaultExt = defaultFileExtension || "txt";
    const finalFileName = `${defaultName}.${defaultExt}`;

    const a = document.createElement("a");
    a.href = url;
    a.download = finalFileName;

    document.body.appendChild(a); // apparently required
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url); // cleanup
});


uploadBtn.addEventListener("click", () => uploadInput.click());

uploadInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const isText = file.type.startsWith("text/") || /\.(txt|csv|log|md|json|xml|html?|js|css|yaml|yml|obj|svg)$/i.test(file.name);

  const reader = new FileReader();

  reader.onload = (e) => {
    if (isText) {
      input.value = e.target.result; // text content
    } else {
      // ArrayBuffer -> hex string
      const bytes = new Uint8Array(e.target.result);
      let hex = "";
      for (let i = 0; i < bytes.length; i++) {
        hex += bytes[i].toString(16).padStart(2, "0");
        if (i % 16 === 15) hex += "\n";
        else hex += " ";
      }
      input.value = hex;
    }
    handleInput();
  };

  if (isText) {
    reader.readAsText(file);
  } else {
    reader.readAsArrayBuffer(file);
  }
});


lapBtn.addEventListener("click", recordLap); // why lap times? why not?

exportLapTimesBtn.addEventListener("click", exportLapTimes);

resumeTimerBtn.addEventListener("click", resumeTimer);

pauseTimerBtn.addEventListener("click", pauseTimer);

resetTimerBtn.addEventListener("click", resetTimer);

const pairs = {
    '(': '()',
    '[': '[]',
    '{': '{}',
    "'": "''",
    '"': '""'
};

input.addEventListener("keydown", (event) => {
    if (pairs[event.key]) {
        insertTextAtCursor(pairs[event.key]);
        event.preventDefault();
        handleInput();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "b") {
        insertTextAtCursor("****");
        input.selectionStart -= 4;
        event.preventDefault();
        handleInput()
    }

    if (event.ctrlKey && event.key === "i") {
        insertTextAtCursor("**");
        input.selectionStart -= 2;
        event.preventDefault();
        handleInput()
    }

    if (event.ctrlKey && event.key === "k") {
        insertTextAtCursor("[text](url)");
        input.selectionStart -= 8;
        event.preventDefault();
        handleInput()
    }
});

fontSelect.addEventListener("change", function () {
    input.style.fontFamily = this.value;
});

fileNameInput.addEventListener("input", () => {
    defaultFileName = fileNameInput.value.trim() || "tadi_lab";
});

fileExtensionSelect.addEventListener("change", () => {
    defaultFileExtension = fileExtensionSelect.value;
});

input.addEventListener("input", () => {
    handleInput();
    localStorage.setItem("editor-content", input.value);
});

consoleToggleCheckbox.addEventListener('change', function() {
    if (consoleToggleCheckbox.checked) {
        eruda.init();
    } else {
        eruda.destroy();
    }
});


input.value = localStorage.getItem("editor-content") || "# Welcome to Tadi Lab\n\nWrite **Markdown**, HTML, and JavaScript here.";
if (localStorage.getItem("dark-mode") === "enabled") {
    document.body.classList.add("dark-mode");
}

intervalId = setInterval(updateTimer, 1000);

async function main() {
    await initializeData(); // wait load
    setupConsole();
    setupAutocomplete();
    handleInput(); // now start
}

editModeSelect.addEventListener('change', function() {
    const selectedValue = editModeSelect.value;
    if (selectedValue === 'input-only') {
        input.classList.remove('hidden');
        preview.classList.add('hidden');
    } else if (selectedValue === 'output-only') {
        input.classList.add('hidden');
        preview.classList.remove('hidden');
    } else if (selectedValue === 'both') {
        input.classList.remove('hidden');
        preview.classList.remove('hidden');
    }
});

// start
main();

// i was told to put async on top...

async function initializeData() {
    try {
        // load JSON files
        window.iconMap = await loadJSON('/coding-tool/data/iconMap.json');
        window.allowedIframeSources = await loadJSON('/coding-tool/data/allowedIframeSources.json');
        window.languageConfigs = await loadJSON('/coding-tool/data/languageConfigs.json');
        window.inputReplacements = (await import('/coding-tool/data/inputReplacements.js')).default;
        window.autocompleteSearchResults = await loadJSON('/coding-tool/data/autocomplete.json');
        
        console.log("Did it", {
            iconMap,
            allowedIframeSources,
            languageConfigs,
            autocompleteSearchResults
        });
    } catch (error) {
        appendErrorMessage(`Error loading JSON files:\n\nMessage: ${error.message}\nStack: ${error.stack}`);
        console.error(`Error loading JSON files: ${error.message} (while loading ${url})\nStack: ${error.stack}`);
    }
}

async function loadJSON(url) {
  const response = await fetch(url);
  return response.json();
}

function setupConsole() {
    let console = eruda.get('console');
    console.config.set('catchGlobalErr', true);
    console.config.set('displayExtraInfo', true);

    let elements = eruda.get('elements');
    elements.config.set('overrideEventTarget', true);

    let info = eruda.get('info');
    info.add('Language', () => navigator.language);
    info.add('Date', () => new Intl.DateTimeFormat(navigator.language).format(Date.now()));

    let benchmark = eruda.get('benchmark');
    benchmark.add('Array Cloning', [
        {
        name: 'Spread operator',
        fn: function () {
            const arr = [1, 2, 3, 4, 5];
            const clone = [...arr];
        }
    },
    {
        name: 'Slice method',
        fn: function () {
            const arr = [1, 2, 3, 4, 5];
            const clone = arr.slice();
        }
    },
    {
        name: 'Array.from',
        fn: function () {
            const arr = [1, 2, 3, 4, 5];
            const clone = Array.from(arr);
        }
    }
]);

    benchmark.add('Multiplication: Math vs Bitwise', [
    {
        name: 'Regular Multiply (x * 2)',
        fn: function () {
            let x = 42;
            x = x * 2;
        }
    },
    {
        name: 'Bitwise Shift (x << 1)',
        fn: function () {
            let x = 42;
            x = x << 1;
        }
    }
]);

benchmark.add('Loop Performance', [
    {
        name: 'Standard for loop',
        fn: function () {
            const arr = new Array(1000).fill(1);
            for (let i = 0; i < arr.length; i++) {
                arr[i] += 1;
            }
        }
    },
    {
        name: 'forEach loop',
        fn: function () {
            const arr = new Array(1000).fill(1);
            arr.forEach((v, i, a) => { a[i] = v + 1; });
        }
    },
    {
        name: 'for...of loop',
        fn: function () {
            let i = 0;
            const arr = new Array(1000).fill(1);
            for (const val of arr) {
                arr[i++] = val + 1;
            }
        }
    }
]);

    benchmark.add('Deep Copy (Simple Object)', [
    {
        name: 'JSON.parse(JSON.stringify)',
        fn: function () {
            const obj = { a: 1, b: { c: 2, d: [3, 4] } };
            const clone = JSON.parse(JSON.stringify(obj));
        }
    },
    {
        name: 'Structured Clone (if available)',
        fn: function () {
            const obj = { a: 1, b: { c: 2, d: [3, 4] } };
            const clone = structuredClone(obj); // In modern browsers
        }
    }
]);

    benchmark.add('String Replace vs Split/Join', [
    {
        name: 'String.replaceAll',
        fn: function () {
            'a-b-c-d-e-f'.replaceAll('-', '_');
        }
    },
    {
        name: 'Split/Join',
        fn: function () {
            'a-b-c-d-e-f'.split('-').join('_');
        }
    }
]);

        benchmark.add('Array Sorting', [
    {
        name: 'Native Array.sort()',
        fn: function () {
            const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 100));
            arr.sort((a, b) => a - b);
        }
    },
    {
        name: 'Insertion Sort (Manual)',
        fn: function () {
            const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 100));
            for (let i = 1; i < arr.length; i++) {
                let key = arr[i];
                let j = i - 1;
                while (j >= 0 && arr[j] > key) {
                    arr[j + 1] = arr[j];
                    j = j - 1;
                }
                arr[j + 1] = key;
            }
        }
    },
    {
        name: 'Bogosort',
        fn: function () {
            const arr = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]; // Keep it small, please 🙏
            function isSorted(a) {
                for (let i = 1; i < a.length; i++) {
                    if (a[i - 1] > a[i]) return false;
                }
                return true;
            }
            function shuffle(a) {
                for (let i = a.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [a[i], a[j]] = [a[j], a[i]];
                }
            }
            while (!isSorted(arr)) {
                shuffle(arr);
            }
        }
    }
]);


}

function handleInput() {
    errorOutput.textContent = "";
    let content = input.value;
    
    // content = escapeHTML(content); // yes do put the raw chicken in the salad i love when my app gets xss
    content = content;
    let parsedHTML = marked.parse(content);

    // you don't believe how many hours fixing this took (just to comment it out later)
    // parsedHTML = sanitizeLinks(parsedHTML);

    preview.innerHTML = parsedHTML;
    Prism.highlightAll();
    updateStats();
}

function setupAutocomplete() {
const data = {
        src: autocompleteSearchResults
};
    const placeHolder = "Pizza, Burger, Sushi";
    const resultsList = {
        element(list, data) {
            if (!data.results.length) {
                // Create "No Results" message list element
                const message = document.createElement("div");
                message.setAttribute("class", "no_result");
                // Add message text content
                message.innerHTML = `<span>Found No Results for "${data.query}"</span>`;
                // Add message list element to the list
                list.prepend(message);
            }
        },
        noResults: true,
    };
    const resultItem = {
        highlight: true
    };

    const autoCompleteJS_01 = new autoComplete({
        selector: "#auto-complete-search",
        placeHolder,
        data,
        resultsList,
        resultItem,
        events: {
            input: {
                focus() {
                    if (autoCompleteJS_01.input.value.length) autoCompleteJS_01.start();
                },
                selection(event) {
                    const selection = event.detail.selection.value;
                    autoCompleteJS_01.input.value = selection;
                }
            },
        },
    });
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
    lapContainer.innerHTML = ""; // this could be made a prompt (wdym?)
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

function updateStats() {
    const text = input.value.trim();
    const words = text ? text.match(/\b\w+\b/g)?.length || 0 : 0;
    const chars = text.length;
    
    const wordsPerMinute = 200;
    const readingMinutes = words / wordsPerMinute;
    const minutes = Math.floor(readingMinutes);
    const seconds = Math.round((readingMinutes - minutes) * 60);
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    stats.textContent = `Words: ${words} | Characters: ${chars} | Reading Time: ${formattedTime}`;
}

function appendErrorMessage(message) {
    if (!errorOutput) return;
    const errorParagraph = document.createElement("p");
    errorParagraph.style.color = "red";
    errorParagraph.textContent = message;
    errorOutput.appendChild(errorParagraph);
}
