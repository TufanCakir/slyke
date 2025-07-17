import { transform } from "metro-transform-worker";

function slykeToJsx(src, filename) {
  // ... dein Slyke-Konverter wie gehabt ...
  // NUR für echte .sk-Dateien!
  let jsVars = [];
  let echoLines = [];
  const lines = (src || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  for (let line of lines) {
    let constMatch = line.match(/^const\s+(\w+)\s*=\s*(.+)$/);
    if (constMatch) {
      let [, key, val] = constMatch;
      if (!/^["'].*["']$/.test(val.trim()) && isNaN(Number(val.trim()))) {
        val = `"${val.trim()}"`;
      }
      jsVars.push(`const ${key} = ${val};`);
      continue;
    }
    if (line.startsWith("echo ")) {
      let content = line.replace(/^echo\s+/, "").replace(/^"|"$/g, "");
      content = content.replace(
        /\{(\w+)\}/g,
        (match, p1) => `\$\{typeof ${p1} !== "undefined" ? ${p1} : ""\}`
      );
      echoLines.push(content);
    }
  }

  let componentName = "SlykeComponent";
  if (filename && typeof filename === "string") {
    const fname = filename.split(/[\/\\]/).pop();
    if (fname && fname.endsWith(".sk")) {
      componentName = fname.replace(/\.sk$/, "") || "SlykeComponent";
    }
  }
  if (
    !componentName ||
    typeof componentName !== "string" ||
    componentName.length === 0
  ) {
    componentName = "SlykeComponent";
  }
  let reactName = "SlykeComponent";
  if (componentName.length > 0) {
    const firstChar = (componentName[0] || "S").toUpperCase();
    reactName = firstChar + componentName.slice(1);
  }

  return `
import React from "react";
import { View, Text } from "react-native";
export default function ${reactName}() {
  ${jsVars.join("\n  ")}
  return (
    <View>
      ${echoLines.map((txt) => `<Text>{\`${txt}\`}</Text>`).join("\n      ")}
    </View>
  );
}
  `.trim();
}

const _transform = function (props) {
  if (!props || typeof props !== "object" || !props.filename) {
    console.log("Loader: No props or filename", props);
    return transform(props || {});
  }

  const filename = props.filename;
  if (typeof filename === "string" && filename.endsWith(".sk")) {
    console.log("Loader: Slyke transform for", filename);
    const src = typeof props.src === "string" ? props.src : "";
    const options = props.options || {};
    const code = slykeToJsx(src, filename);
    return transform({
      src: code,
      filename: filename.replace(/\.sk$/, ".js"),
      options,
    });
  }

  // Debug: Für andere Dateien
  console.log("Loader: Standard transform for", filename);
  return transform(props);
};
export { _transform as transform };
