const fs = require("fs");

const slykeFile = process.argv[2];
if (!slykeFile) {
  console.log("Please provide a .slyke file.");
  process.exit(1);
}
const code = fs.readFileSync(slykeFile, "utf-8");

// Name erkennen
const nameMatch = code.match(/name\s*=\s*(\w+)\s*=\s*["'](.*?)["']/);
const screenName = nameMatch ? nameMatch[1] : "ThreeTestScreen";
const screenTitle = nameMatch ? nameMatch[2] : "";

// Props aus Function-Block extrahieren
const props = {};
const funcMatch = code.match(/function\s+\w+\s*\{([\s\S]*?)\}/);
if (funcMatch) {
  const block = funcMatch[1];
  ["light", "camera", "render.Three", "native", "fast", "effect"].forEach(
    (key) => {
      const re = new RegExp(`${key}\\s*=\\s*\\{?true\\}?`, "i");
      props[key] = re.test(block);
    }
  );
}

// Backtick-Block (Shader/Macro)
const macroMatch = code.match(/`([\s\S]*?)`/);
const macro = macroMatch
  ? macroMatch[1]
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
  : [];

// Effekt, Koordinaten, View
let effectType = null,
  coords = {};
const viewMatch = code.match(/\{effect\}:\s*\$\{(\w+)\},\s*\[([^\]]+)\]/);
if (viewMatch) {
  effectType = viewMatch[1];
  viewMatch[2].split(",").forEach((pair) => {
    const [k, v] = pair
      .split(":")
      .map((x) => x && x.replace(/["']/g, "").trim());
    if (k && v) coords[k] = v;
  });
}

// Farb- und Würfel-Logik aus FastScreen
let diceColor = "red",
  echoText = "";
const diceMatch = code.match(
  /\{\{\s*dice:\s*color\.(\w+)\s*\+\s*echo\s*["'](.+?)["']/
);
if (diceMatch) {
  diceColor = diceMatch[1];
  echoText = diceMatch[2];
}

// Ausgabe im Playground-Style:
console.log("\n=== Slyke 3D Playground ===\n");
console.log("Screen:", screenName);
if (screenTitle) console.log("Screen Title:", screenTitle);
console.log("\nAktive Props:");
Object.entries(props).forEach(([k, v]) => {
  if (v) console.log("  -", k, ": ON");
});

if (macro.length) {
  console.log("\nBacktick-Block (3D-Setup/Shader):");
  macro.forEach((cmd) => console.log("  ·", cmd));
}
if (props["render.Three"]) {
  console.log("\n3D Objekt: Dice");
  console.log("  - Color:", diceColor);
  if (props.native) console.log("  - Rendering: Native");
  if (props.fast) console.log("  - Performance: Fast");
}

if (echoText) {
  console.log("\nInfo-Text:");
  console.log("  ", echoText);
}

if (props.effect && effectType) {
  console.log("\nEffekt:", effectType);
  console.log("  - Koordinaten:", coords);
}

console.log("\n---");
console.log("3D Scene Rendering complete.\n");
