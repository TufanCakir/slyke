// slyke-image-interpreter.js
const fs = require("fs");

// Slyke einlesen
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

let images = {};
let styles = {};

lines.forEach((line, idx) => {
  // Bild-Komponente erkennen
  const imgMatch = line.match(/^<Image=\{([a-zA-Z0-9_]+)\} \/>$/);
  if (imgMatch) {
    const imgId = imgMatch[1];
    images[imgId] = true; // Bild gemerkt
    // Style direkt darunter suchen
    const nextLine = lines[idx + 1] || "";
    const styleMatch = nextLine.match(new RegExp(`^${imgId} \\{(.+)\\}$`));
    if (styleMatch) {
      // Stylestring zu Objekt parsen
      const styleObj = {};
      styleMatch[1].split(",").forEach((pair) => {
        let [key, val] = pair.split(":").map((s) => s.trim());
        if (key && val) {
          if (val.endsWith(")")) {
            // z. B. scale(1)
            styleObj[key] = val;
          } else {
            styleObj[key] = Number(val);
          }
        }
      });
      styles[imgId] = styleObj;
    }
  }
});

// Ausgabe: „UI“ zeigen
for (let imgId in images) {
  const style = styles[imgId] || {};
  console.log(`Image: ${imgId}.png`);
  console.log("Style:", style);
}
