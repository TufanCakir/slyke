const fs = require("fs");

const slykeFile = process.argv[2];
if (!slykeFile) {
  console.log("Please provide a .slyke file.");
  process.exit(1);
}
const code = fs.readFileSync(slykeFile, "utf-8");

// Styles inline beim const testCalender
let inlineStyles = {},
  calenderScale = 1;
const inlineMatch = code.match(/const\s+testCalender\s*=\s*\{([\s\S]*?)\}/);
if (inlineMatch) {
  inlineMatch[1]
    .split(",")
    .map((s) => s.trim())
    .forEach((pair) => {
      if (!pair) return;
      let [k, v] = pair.split(":").map((x) => x.trim());
      if (k === "calender" && /scale\((\d+)\)/.test(v)) {
        calenderScale = parseInt(RegExp.$1);
      } else if (k && v) {
        inlineStyles[k] = v.replace(/["']/g, "");
      }
    });
}

// Styles via StyleSheet
let styles = {};
const stylesMatch = code.match(
  /const styles\s*=\s*StyleSheet\.create\{\{([\s\S]*?)\}\};/
);
if (stylesMatch) {
  const s = stylesMatch[1].replace(/[\n\r]/g, "");
  const contMatch = s.match(/container:\s*\{([^}]*)\}/);
  if (contMatch) {
    contMatch[1].split(",").forEach((pair) => {
      let [k, v] = pair.split(":").map((x) => x && x.trim());
      if (k && v) styles[k] = v.replace(/["']/g, "");
    });
  }
}

// Calender-Komponente in <FastScreen> finden (optional als Props)
let calenderProps = {};
const fastScreenMatch = code.match(/<FastScreen[^>]*>\s*\{calender\}/);
if (fastScreenMatch) {
  // Props könnten später ergänzt werden, jetzt: Demo = keine
}

// Echo-Text
let echoText = "";
const echoMatch = code.match(/echo\s*["'](.+?)["']/);
if (echoMatch) echoText = echoMatch[1];

// Ausgabe im Playground-Style
console.log("\n=== Slyke Calender Playground ===\n");
console.log("Calender-Konfiguration:");
console.log("  Inline-Styles:", inlineStyles);
console.log("  Calender Scale:", calenderScale);
console.log("  StyleSheet Styles (container):", styles);

if (echoText) {
  console.log("\nEcho-Text:", echoText);
}

console.log("\nKomponentenbaum:");
console.log("  <Native>");
console.log("    <FastScreen>");
console.log("      {calender}");
console.log("    </FastScreen>");
console.log("  </Native>");
console.log("  <View>");
console.log("    <Text>");
console.log("     ", echoText ? echoText : "(kein Text)");
console.log("    </Text>");
console.log("  </View>");

console.log("\n---");
console.log("Calender Rendering complete.\n");
