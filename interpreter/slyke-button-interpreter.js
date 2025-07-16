// slyke-button-interpreter.js
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

let variables = {};
let functions = {};
let buttons = {};
let handlers = {};

lines.forEach((line) => {
  // Variable
  if (line.startsWith("let ")) {
    const [, name, value] = line.match(/^let (\w+) = (.+)$/) || [];
    if (name) variables[name] = eval(value);
    return;
  }

  // Funktion
  if (line.startsWith("function ")) {
    const fnMatch = line.match(/^function (\w+)\((.*)\) \{$/);
    if (fnMatch) {
      const fnName = fnMatch[1];
      const params = fnMatch[2]
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      let body = [];
      let idx = lines.indexOf(line) + 1;
      while (!lines[idx].startsWith("}")) {
        body.push(lines[idx]);
        idx++;
      }
      functions[fnName] = { params, body };
    }
    return;
  }

  // Button
  if (line.startsWith("<Button")) {
    const idMatch = line.match(/id=([a-zA-Z0-9_]+)/);
    const labelMatch = line.match(/>(.*)<\/Button>/);
    if (idMatch && labelMatch) {
      buttons[idMatch[1]] = labelMatch[1];
    }
    return;
  }

  // onTap handler
  if (line.startsWith("onTap={")) {
    const handlerMatch = line.match(/onTap=\{([a-zA-Z0-9_]+)\} \{ (.*) \}/);
    if (handlerMatch) {
      handlers[handlerMatch[1]] = handlerMatch[2];
    }
    return;
  }
});

// Show all buttons
console.log("Buttons:");
for (let id in buttons) {
  console.log(`- [${id}]: ${buttons[id]}`);
}

// Terminal input for button selection
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.setPrompt("Which button? ");
rl.prompt();

rl.on("line", function (line) {
  const btnId = line.trim();
  if (!buttons[btnId]) {
    console.log("No such button!");
    rl.prompt();
    return;
  }

  // Execute handler code (simple version)
  const handler = handlers[btnId];
  if (!handler) {
    console.log("No handler for this button!");
    rl.prompt();
    return;
  }

  // e.g. handler = "add(100)"
  const fnCall = handler.match(/(\w+)\((.*)\)/);
  if (fnCall) {
    const fnName = fnCall[1];
    const argString = fnCall[2];
    const args = argString.split(",").map((a) => eval(a.trim()));
    if (functions[fnName]) {
      // Only support one param for simplicity
      const param = functions[fnName].params[0];
      const oldCount = variables["count"];
      // Replace parameter in body
      functions[fnName].body.forEach((l) => {
        // e.g. count = count + amount
        if (l.includes("count = count +")) {
          const inc = args[0];
          variables["count"] += inc;
        }
        if (l.startsWith("echo ")) {
          const value = variables["count"];
          console.log(`Count: ${value}`);
        }
      });
    }
  }
  rl.prompt();
});
