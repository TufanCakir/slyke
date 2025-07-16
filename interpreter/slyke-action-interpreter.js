const fs = require("fs");

// Datei einlesen
const slykeFile = process.argv[2];
if (!slykeFile) {
  console.log("Please provide a .slyke file.");
  process.exit(1);
}
const code = fs.readFileSync(slykeFile, "utf-8");
const lines = code
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean);

const functions = {};
let currentFunc = null;
let exportFuncs = [];
let arrays = {};
let inArray = false;

// Funktion & Export erkennen
lines.forEach((line) => {
  if (/^const (\w+) export function\s*\{/.test(line)) {
    currentFunc = RegExp.$1;
    functions[currentFunc] = [];
    exportFuncs.push(currentFunc);
  } else if (/^function\s*\{/.test(line)) {
    currentFunc = `anon${Object.keys(functions).length}`;
    functions[currentFunc] = [];
  }
  // Array-Block erkennen
  else if (line.startsWith("[") && line.endsWith("]")) {
    inArray = true;
    const arr = line
      .replace(/[\[\]]/g, "")
      .split(",")
      .map((s) => s.trim());
    arrays[currentFunc] = arr;
    functions[currentFunc].push({ type: "array", value: arr });
  }
  // Action oder Animation
  else if (currentFunc && !line.startsWith("}") && !line.startsWith("<")) {
    if (/animation\{(.+)\}/.test(line)) {
      functions[currentFunc].push({ type: "animation", value: RegExp.$1 });
    } else if (/run:\s*\{(.+)\}/.test(line)) {
      functions[currentFunc].push({ type: "run", value: RegExp.$1 });
    } else if (/move:\s*\{(.+)\}/.test(line)) {
      functions[currentFunc].push({ type: "move", value: RegExp.$1 });
    } else if (/^(\w+)\.(\w+)/.test(line)) {
      functions[currentFunc].push({ type: "action", value: line });
    }
  }
  // Funktion schließen
  else if (line.startsWith("}")) {
    currentFunc = null;
    inArray = false;
  }
});

// Komponenten-Block (nur für Demo)
const fastScreenLines = [];
let inFastScreen = false;
lines.forEach((line) => {
  if (line.startsWith("<FastScreen")) {
    inFastScreen = true;
  } else if (inFastScreen && line.startsWith("}")) {
    inFastScreen = false;
  } else if (inFastScreen) {
    // ${forward}, ${back} etc.
    const match = line.match(/\$\{(\w+)\}/);
    if (match) {
      const arrName = match[1];
      if (arrays[arrName]) {
        fastScreenLines.push(...arrays[arrName]);
      }
    }
  }
});

// Haupt-Call am Ende erkennen und ausführen
const mainCall = lines.find((line) => /^test\(\)/.test(line));
if (mainCall && functions["test"]) {
  console.log("\nStarte test():");
  functions["test"].forEach((act) => {
    if (act.type === "action") {
      console.log("Aktion:", act.value);
    }
    // Du kannst für Animation, run, move, arrays etc. noch weitere Handler bauen!
  });
}

// Demo-Ausgabe: FastScreen-Bewegungen
if (fastScreenLines.length) {
  console.log("\nFastScreen Bewegungen (aus Arrays):");
  fastScreenLines.forEach((a) => {
    console.log("-", a);
  });
}
