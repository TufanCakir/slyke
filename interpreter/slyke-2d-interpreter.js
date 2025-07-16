const fs = require("fs");

const slykeFile = process.argv[2];
if (!slykeFile) {
  console.log("Please provide a .slyke file.");
  process.exit(1);
}
const code = fs.readFileSync(slykeFile, "utf-8");

// Funktion "test" extrahieren
let moves = [],
  props = {};
const funcMatch = code.match(/const function test\((.*?)\)\s*\{([\s\S]*?)\}/);
if (funcMatch) {
  // Parameter: move, effekt, dice, color, explosion
  const params = funcMatch[1].split(",").map((x) => x.trim());
  const actions = funcMatch[2]
    .split(",")
    .map((x) => x.replace(/[\n\r]/g, "").trim())
    .filter(Boolean);
  actions.forEach((act) => {
    // move.right → move, right
    if (act.startsWith("move.")) {
      moves.push(act.split(".")[1]);
    } else if (params.includes(act)) {
      props[act] = true;
    }
  });
}

// Funktionsblock mit echo (du hast verloren)
let echoText = "";
const echoMatch = code.match(/echo\s*["'](.+?)["']/);
if (echoMatch) echoText = echoMatch[1];

// Canvas-Farbe und Dice finden
const canvasMatch = code.match(/<Canvas[^>]*>\s*\{(\w+)\}\s*\{(\w+)\}/);
let canvasColor = "",
  canvasDice = "";
if (canvasMatch) {
  canvasColor = canvasMatch[1];
  canvasDice = canvasMatch[2];
}

// Effekt/Koordinaten
const effektMatch = code.match(/<Effekt[^>]*>\s*\$\{([^\}]+)\}/);
let effektCoords = "";
if (effektMatch) effektCoords = effektMatch[1];

// Styles
const stylesMatch = code.match(
  /const styles\s*=\s*StyleSheet\.create\{\{([\s\S]*?)\}\};/
);
let styleContainer = "",
  styleText = "";
if (stylesMatch) {
  const s = stylesMatch[1]
    .replace(/[\n\r]/g, "")
    .replace(/container:\s*\{([^}]*)\}/, (m, props) => {
      styleContainer = props.trim();
      return "";
    })
    .replace(/text:\s*\{([^}]*)\}/, (m, props) => {
      styleText = props.trim();
      return "";
    });
}

// Ausgabe im Terminal
console.log("\n=== Slyke 2D Playground ===\n");
console.log("Funktion test():");
console.log("  Moves:", moves.join(", "));
Object.keys(props).forEach((p) => {
  if (props[p]) console.log("  Prop:", p);
});
if (canvasColor) console.log("Canvas color:", canvasColor);
if (canvasDice) console.log("Canvas dice:", canvasDice);

console.log("\nNative + FastScreen Wrapper:");
console.log("  test(), effekt, explosion");

if (echoText) console.log("\nEcho-Text:", echoText);

if (effektCoords) {
  console.log("\nEffekt-Komponente:");
  console.log("  Effekt-Koordinaten:", effektCoords);
}
if (styleContainer || styleText) {
  console.log("\nStyles:");
  if (styleContainer) console.log("  Canvas:", styleContainer);
  if (styleText) console.log("  Text:", styleText);
}
console.log("\n---");
console.log("2D Scene Rendering complete.\n");
