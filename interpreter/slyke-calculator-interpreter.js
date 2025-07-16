const fs = require("fs");

// Datei einlesen
const slykeFile = process.argv[2];
if (!slykeFile) {
  console.log("Please provide a .slyke file.");
  process.exit(1);
}
const code = fs.readFileSync(slykeFile, "utf-8");

// Calculator-Array finden
let calculatorArray = [];
const calcArrMatch = code.match(/let calculator\s*\{([\s\S]*?)\}/);
if (calcArrMatch) {
  // Finde das Array
  const arrContent = calcArrMatch[1].replace(/[\[\]\n]/g, "");
  calculatorArray = arrContent
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => (isNaN(Number(v)) ? v : Number(v)));
}

// Styles extrahieren (minimal)
let styles = {};
const stylesMatch = code.match(
  /const styles\s*=\s*create\s*\{\{([\s\S]*?)\}\};/
);
if (stylesMatch) {
  const s = stylesMatch[1]
    .replace(/[\n\r]/g, "")
    .replace(/container:\s*\{([^}]*)\}/, (m, props) => {
      styles.container = {};
      props.split(",").forEach((pair) => {
        const [k, v] = pair.split(":").map((x) => x && x.trim());
        if (k && v) styles.container[k] = v;
      });
      return "";
    })
    .replace(/text:\s*\{([^}]*)\}/, (m, props) => {
      styles.text = {};
      props.split(",").forEach((pair) => {
        const [k, v] = pair.split(":").map((x) => x && x.trim());
        if (k && v) styles.text[k] = v;
      });
      return "";
    });
}

// Calculator-Komponente finden (hier: alles, was zwischen <Calculator> und </Calculator> steht)
const calcCompMatch = code.match(/<Calculator[^>]*>([\s\S]*?)<\/Calculator>/);
let calcText = "";
if (calcCompMatch) {
  const content = calcCompMatch[1];
  // Finde <Text ...>...</Text>
  const textMatch = content.match(/<Text[^>]*>(.*?)<\/Text>/);
  if (textMatch) calcText = textMatch[1].trim();
}

// Rendern im Terminal (Demo)
console.log("=== Slyke Calculator ===\n");
console.log("Tasten:");
let row = "";
calculatorArray.forEach((v, i) => {
  row += v.toString().padStart(4, " ");
  // Immer 4 pro Zeile (für dein Beispiel-Layout)
  if ((i + 1) % 4 === 0) {
    console.log(row);
    row = "";
  }
});
if (row) console.log(row);
console.log("\nKomponenten-Text:", calcText);

console.log("\nStyles (container):", styles.container || "(keine)");
console.log("Styles (text):", styles.text || "(keine)");
