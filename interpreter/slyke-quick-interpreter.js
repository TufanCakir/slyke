const readline = require("readline");
const fs = require("fs");

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

let context = {};

function interpolate(str, context) {
  return str.replace(/\{(\w+)\}/g, (_, key) => context[key] ?? "");
}

function evalQuick(expr, ctx) {
  // $[name + lastName + age]
  return expr
    .split("+")
    .map((w) => ctx[w.trim()] || "")
    .join(" ");
}

function parseQuickConst(line) {
  // "const Tufan Cakir ich bin 29 jahre alt"
  const m = line.match(/^const\s+(\w+)\s+(\w+).*?(\d+)\s+jahre/i);
  if (m) {
    context.name = m[1];
    context.lastName = m[2];
    context.age = m[3];
    return true;
  }
  return false;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function processLines(idx = 0) {
  if (idx >= lines.length) {
    rl.close();
    return;
  }
  let line = lines[idx];

  // Klassische Const-Syntax
  let constMatch = line.match(/^const\s+(\w+)\s*=\s*(.+)$/);
  if (constMatch) {
    let [, key, val] = constMatch;
    context[key] = val;
    return processLines(idx + 1);
  }

  // Quick-Const-Syntax
  if (parseQuickConst(line)) {
    return processLines(idx + 1);
  }

  // Echo mit Interpolation
  if (line.startsWith("echo ")) {
    if (line.includes("$[")) {
      // Kurzinterpolation
      const quickMatch = line.match(/\$\[([^\]]+)\]/);
      if (quickMatch) {
        const res = evalQuick(quickMatch[1], context);
        console.log(res);
      }
    } else if (line === 'echo ""') {
      rl.question("> ", (input) => {
        context.input = input;
        processLines(idx + 1);
      });
      return;
    } else {
      // Interpolation mit {name}
      let msg = line.replace(/^echo\s+/, "").replace(/^"|"$/g, "");
      msg = interpolate(msg, context);
      console.log(msg);
    }
    return processLines(idx + 1);
  }

  processLines(idx + 1);
}

processLines();
