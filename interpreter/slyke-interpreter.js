// slyke-interpreter.js
const fs = require("fs");

// Datei laden
const slykeFile = process.argv[2];
if (!slykeFile) {
  console.log("Please provide a .slyke file.");
  process.exit(1);
}
const code = fs.readFileSync(slykeFile, "utf-8");

// State
let variables = {};
let screens = {};
let currentScreen = null;

// Slyke parsen
const lines = code
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean);

let inScreen = false;
let screenName = "";
let screenContent = [];

lines.forEach((line) => {
  // Variablen
  if (line.startsWith("let ")) {
    // z.B. let count = 0
    const [, name, value] = line.match(/^let (\w+) = (.+)$/) || [];
    if (name) {
      variables[name] = eval(value);
    }
    return;
  }

  // Screen Start
  if (line.startsWith("Screen ")) {
    inScreen = true;
    screenName = line.match(/^Screen (\w+)/)[1];
    screenContent = [];
    return;
  }
  // Screen Ende
  if (inScreen && line === "}") {
    screens[screenName] = [...screenContent];
    inScreen = false;
    screenName = "";
    return;
  }
  // Screen-Inhalt
  if (inScreen) {
    screenContent.push(line);
    return;
  }
});

// Simpler "App-Flow": Startscreen anzeigen, echo-Befehle ausführen
function showScreen(name) {
  const content = screens[name];
  if (!content) {
    console.log("Screen not found:", name);
    return;
  }
  currentScreen = name;
  console.log(`--- [Screen: ${name}] ---`);
  content.forEach((line) => {
    // echo
    const echoMatch =
      line.match(/^echo "(.+)"$/) || line.match(/^echo "(.+)" \+ (.+)$/);
    if (echoMatch) {
      if (echoMatch.length === 3) {
        // echo "Text" + variable
        let value = echoMatch[1];
        const varName = echoMatch[2].trim();
        value += variables[varName] !== undefined ? variables[varName] : "";
        console.log(value);
      } else {
        // echo "Text"
        console.log(echoMatch[1]);
      }
      return;
    }
  });
}

// Zeige Startscreen ("Home")
showScreen("Home");

// Optional: Counter-Screen testen
showScreen("Counter");
