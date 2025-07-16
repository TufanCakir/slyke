const fs = require("fs");

const slykeFile = process.argv[2];
if (!slykeFile) {
  console.log("Please provide a .slyke file.");
  process.exit(1);
}
const code = fs.readFileSync(slykeFile, "utf-8");

// Fenster-Setup extrahieren
let maxWindows = 0;
const windowComponents = {}; // Fenster-ID → Liste von Komponenten

code.split("\n").forEach((line) => {
  // Maximal erlaubte Fenster finden
  const popupMatch = line.match(/<PopUp window=\{(\d+)\}/);
  if (popupMatch) maxWindows = Number(popupMatch[1]);

  // Alle Komponenten mit window${n} oder window={n}
  const winMatch = line.match(/<(\w+)[^>]*window(?:\$|\=)\{?(\d+)\}?/);
  if (winMatch) {
    const comp = winMatch[1];
    const winId = Number(winMatch[2]);
    if (winId > maxWindows) {
      throw new Error(
        `❌ Fenster ${winId} ist nicht erlaubt! Maximal ${maxWindows} Fenster erlaubt (definiert in <PopUp>).`
      );
    }
    if (!windowComponents[winId]) windowComponents[winId] = [];
    windowComponents[winId].push(comp);
  }
});

console.log(`Erlaubte Fenster: ${maxWindows}\n`);

// Zeige pro Fenster die Buttons & Komponenten:
for (let i = 1; i <= maxWindows; i++) {
  console.log(`--- Fenster ${i} ---`);
  console.log("Button: OPEN");
  console.log("Button: CLOSE");
  if (windowComponents[i]) {
    console.log(
      "Komponenten in diesem Fenster:",
      windowComponents[i].join(", ")
    );
  } else {
    console.log("Keine Komponenten zugeordnet.");
  }
  console.log("");
}
