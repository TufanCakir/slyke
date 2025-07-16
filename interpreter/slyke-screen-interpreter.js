// slyke-screen-interpreter.js
const fs = require("fs");
const readline = require("readline");

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

// Data-Strukturen
let screens = {};
let handlers = {};

let currentScreen = "Home";
let running = true;

// 1. Screens parsen
let idx = 0;
while (idx < lines.length) {
  const line = lines[idx];
  if (
    line.startsWith("<FastScreen") ||
    line.startsWith("<Screen") ||
    line.startsWith("<Native")
  ) {
    const type = line.startsWith("<FastScreen")
      ? "FastScreen"
      : line.startsWith("<Screen")
      ? "Screen"
      : "Native";
    let name = "";
    if (type !== "Native") {
      const match = line.match(/name="(\w+)"/);
      if (match) name = match[1];
    } else {
      name = "Native";
    }
    let content = [];
    idx++;
    while (idx < lines.length && !lines[idx].startsWith("</")) {
      content.push(lines[idx]);
      idx++;
    }
    screens[name] = { type, content };
  }
  // Handler
  if (line.startsWith("onTap={")) {
    const match = line.match(/onTap=\{([a-zA-Z0-9_]+)\} \{ (.+) \}/);
    if (match) {
      handlers[match[1]] = match[2];
    }
  }
  idx++;
}

// 2. Render-Funktion
function renderScreen(name) {
  const screen = screens[name];
  if (!screen) {
    console.log("Screen not found:", name);
    running = false;
    return;
  }
  console.log(`\n[${screen.type}] ${name}`);
  let buttons = [];
  for (let line of screen.content) {
    if (line.startsWith("<Text>")) {
      const txt = line.replace("<Text>", "").replace("</Text>", "");
      console.log(txt);
    }
    if (line.startsWith("<Button")) {
      const idMatch = line.match(/id="(\w+)"/);
      const labelMatch = line.match(/>(.*)<\/Button>/);
      if (idMatch && labelMatch) {
        console.log(`Button: ${labelMatch[1]} [${idMatch[1]}]`);
        buttons.push(idMatch[1]);
      }
    }
  }
  // Button Prompt
  if (buttons.length > 0) {
    askButton(buttons);
  } else {
    running = false;
  }
}

// 3. Button-Interaktion
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askButton(buttons) {
  rl.question("Which button? ", (answer) => {
    if (!buttons.includes(answer)) {
      console.log("No such button on this screen!");
      askButton(buttons);
      return;
    }
    // Handler ausführen
    if (handlers[answer]) {
      evalHandler(handlers[answer]);
    } else {
      console.log("No handler!");
      askButton(buttons);
    }
  });
}

function evalHandler(code) {
  // Nur navigate und echo für Demo
  if (code.startsWith('navigate("')) {
    const match = code.match(/navigate\("(\w+)"\)/);
    if (match) {
      renderScreen(match[1]);
    }
  }
  if (code.startsWith("echo(")) {
    const match = code.match(/echo\("(.+)"\)/);
    if (match) {
      console.log(match[1]);
      // Nach Native-Action zurück zur Auswahl
      renderScreen("Native");
    }
  }
}

renderScreen(currentScreen);
