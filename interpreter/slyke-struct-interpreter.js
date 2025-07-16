const fs = require("fs");

const slykeFile = process.argv[2];
if (!slykeFile) {
  console.log("Please provide a .slyke file.");
  process.exit(1);
}
const code = fs.readFileSync(slykeFile, "utf-8");

console.log("\n=== Slyke Struct Playground ===\n");

// Prüfe auf NativeStruct als Root-Wrapper
const hasNativeStruct =
  /<NativeStruct[\s\S]*?>[\s\S]*?{struct}[\s\S]*?<\/NativeStruct>/.test(code);
if (hasNativeStruct) {
  console.log("✔️  NativeStruct-Wrapper gefunden.");
} else {
  console.log(
    "❌ Kein NativeStruct-Wrapper gefunden! Bitte in index.slyke als Root-Wrapper einbauen."
  );
}

// Checks: Doppelte Variablennamen/Funktionsnamen
let names = [];
const constMatches = [...code.matchAll(/\bconst\s+([a-zA-Z_][a-zA-Z0-9_]*)/g)];
constMatches.forEach((m) => names.push(m[1]));
const funcMatches = [
  ...code.matchAll(/\bfunction\s+([a-zA-Z_][a-zA-Z0-9_]*)/g),
];
funcMatches.forEach((m) => names.push(m[1]));

let duplicates = names.filter((item, idx) => names.indexOf(item) !== idx);
if (duplicates.length > 0) {
  console.log(
    "\n❌ Doppelte Namen gefunden:",
    [...new Set(duplicates)].join(", ")
  );
} else {
  console.log("\n✔️  Keine doppelten Variablen-/Funktionsnamen gefunden.");
}

// Check: Fehlende Klammern
let openBrackets = (code.match(/{/g) || []).length;
let closeBrackets = (code.match(/}/g) || []).length;
if (openBrackets !== closeBrackets) {
  console.log(
    `\n❌ Anzahl geschweifter Klammern stimmt nicht! Offen: ${openBrackets}, Geschlossen: ${closeBrackets}`
  );
} else {
  console.log("\n✔️  Anzahl der geschweiften Klammern stimmt überein.");
}

// Check: Fehlende Semikolons
let missingSemis = [];
code.split("\n").forEach((line, i) => {
  // Simple: alles was wie eine Zuweisung aussieht, sollte enden mit ;
  if (
    (line.includes("=") || line.trim().startsWith("export")) &&
    !line.trim().endsWith(";") &&
    !line.trim().endsWith("{") &&
    !line.trim().endsWith("}") &&
    !line.trim().startsWith("import") &&
    !line.trim().startsWith("const styles")
  ) {
    missingSemis.push(i + 1);
  }
});
if (missingSemis.length > 0) {
  console.log(
    "\n❌ Mögliche fehlende Semikolons in Zeile(n):",
    missingSemis.join(", ")
  );
} else {
  console.log("\n✔️  Keine fehlenden Semikolons gefunden.");
}

// Check: Keine doppelten Komponenten im selben File
const tagNames = [...code.matchAll(/<([A-Z][a-zA-Z0-9]*)/g)].map((m) => m[1]);
const tagDuplicates = tagNames.filter((v, i) => tagNames.indexOf(v) !== i);
if (tagDuplicates.length > 0) {
  console.log(
    "\n⚠️  Doppelte Komponenten-Tags gefunden (evtl. ok):",
    [...new Set(tagDuplicates)].join(", ")
  );
} else {
  console.log("\n✔️  Keine doppelten Komponenten-Tags.");
}

console.log("\n---");
console.log("Struct-Check abgeschlossen.\n");
