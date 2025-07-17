const fs = require("fs");
const path = require("path");

const skFile = process.argv[2];
if (!skFile) {
  console.log("Bitte eine .sk Datei angeben!");
  process.exit(1);
}

const fileBase = path.basename(skFile, ".sk");
const componentName = fileBase.charAt(0).toUpperCase() + fileBase.slice(1);

const code = fs.readFileSync(skFile, "utf-8");
const lines = code
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean);

let jsxContent = "";
let imports = [
  'import React from "react";',
  'import { View, Text } from "react-native";',
];

for (let line of lines) {
  // Komponenten-Tag z.B. <Calculator />
  const match = line.match(/^<([A-Z]\w*)\s*\/>$/);
  if (match) {
    const comp = match[1];
    const importStr = `import ${comp} from "./${comp}";`;
    if (!imports.includes(importStr)) imports.push(importStr);
    jsxContent += `    <${comp} />\n`;
    continue;
  }

  // echo "Hallo {name}"
  if (line.startsWith("echo ")) {
    let msg = line.replace(/^echo\s+/, "").replace(/^"|"$/g, "");
    // Variablen innerhalb {} in ${}
    msg = msg.replace(/\{(\w+)\}/g, "${$1}");
    jsxContent += `    <Text>{\`${msg}\`}</Text>\n`;
    continue;
  }

  // Nur Text (ohne echo)
  if (line.length > 0) {
    jsxContent += `    <Text>${line}</Text>\n`;
    continue;
  }
}

if (!jsxContent) jsxContent = "    <Text>Kein Inhalt gefunden!</Text>\n";

const out = `
${imports.join("\n")}
export default function ${componentName}() {
  return (
    <View>
${jsxContent.trim()}
    </View>
  );
}
`.trim();

const outFile = skFile.replace(/\.sk$/, ".jsx");
fs.writeFileSync(outFile, out, "utf-8");
console.log(`Fertig! Generiert: ${outFile}`);
