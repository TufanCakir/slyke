const readline = require("readline");

const context = {
  name: "Tufan",
  lastName: "Cakir",
  age: 29,
};

const lines = [
  'echo "Welcome to Slyke!"',
  'echo "Slyke ist eine moderne einfache schnelle Programmiersprache"',
  'echo "ich heiße " + name + " " + lastName + " und bin " + age + " jahre alt."',
  'echo "wie ist dein Name"',
  'echo ""',
];

// Simples Ausführungsmodell:
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function processLines(idx = 0) {
  if (idx >= lines.length) {
    rl.close();
    return;
  }
  let line = lines[idx].trim();
  if (line === 'echo ""') {
    rl.question("> ", (input) => {
      context.input = input;
      processLines(idx + 1);
    });
  } else if (line.startsWith("echo ")) {
    // Variablen ersetzen, primitive Version:
    let out = line.slice(5).replace(/"/g, "");
    Object.keys(context).forEach((key) => {
      out = out.replace(new RegExp(key, "g"), context[key]);
    });
    console.log(out);
    processLines(idx + 1);
  } else {
    processLines(idx + 1);
  }
}

processLines();
