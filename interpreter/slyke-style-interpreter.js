const fs = require("fs");

// Datei laden
const slykeFile = process.argv[2];
if (!slykeFile) {
  console.log("Please provide a .slyke file.");
  process.exit(1);
}
const code = fs.readFileSync(slykeFile, "utf-8");

// Styles extrahieren
const styleBlockMatch = code.match(/create\{\{([\s\S]*?)\}\}/);
let styleObj = {};
if (styleBlockMatch) {
  // Einfacher Mini-Parser (KEIN echtes JS!)
  let styles = styleBlockMatch[1]
    .replace(/[\n\r]/g, "")
    .split("},")
    .map((s) => s.trim())
    .filter(Boolean);

  styles.forEach((s) => {
    let [key, val] = s.split(": {");
    if (!key || !val) return;
    key = key.trim();
    let entries = val
      .replace(/}/g, "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    let entryObj = {};
    entries.forEach((e) => {
      let [k, v] = e.split(":").map((x) => x.trim());
      if (k && v) entryObj[k] = v;
      else if (k && !v) entryObj[k] = true; // für Werte wie "center"
    });
    styleObj[key] = entryObj;
  });
}

// Komponenten & Style-Refs extrahieren (nur oberste Ebene für Demo)
const lines = code.split("\n").map((l) => l.trim());
lines.forEach((line) => {
  // <FastScreen styles.[container, button, buttonText, items]>
  const styleMatch = line.match(/styles?\.\[([a-zA-Z0-9_,\s]+)\]/);
  if (styleMatch) {
    let comps = styleMatch[1].split(",").map((s) => s.trim());
    console.log("Komponente: FastScreen");
    console.log("Verwendete Styles:", comps);

    // Kombiniere alle Styles
    let combined = {};
    comps.forEach((styleName) => {
      Object.assign(combined, styleObj[styleName] || {});
    });
    console.log("Resultierender Style:", combined);
  }

  // <Native style.content>
  const singleStyleMatch = line.match(/style\.([a-zA-Z0-9_]+)/);
  if (singleStyleMatch) {
    let sName = singleStyleMatch[1];
    console.log("Komponente: Native");
    console.log("Verwendeter Style:", sName);
    console.log("Style:", styleObj[sName]);
  }
});
