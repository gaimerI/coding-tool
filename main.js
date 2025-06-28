let defaultFileName = "tadi_lab";
let defaultFileExtension = "txt";

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
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            input.value = e.target.result;
            handleInput();
        };
        reader.readAsText(file);
    }
});

lapBtn.addEventListener("click", recordLap); // why lap times? why not?

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
