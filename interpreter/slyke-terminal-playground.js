const fs = require("fs");
const readline = require("readline");

const slykeFile = process.argv[2];
if (!slykeFile) {
  console.log("Please provide a .slyke file.");
  process.exit(1);
}
const code = fs.readFileSync(slykeFile, "utf-8");

// Fenster und Komponenten extrahieren
let maxWindows = 0;
const windowComponents = {};
const windowState = {}; // Offen/zu

code.split("\n").forEach((line) => {
  const popupMatch = line.match(/<PopUp window=\{(\d+)\}/);
  if (popupMatch) maxWindows = Number(popupMatch[1]);

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
    windowState[winId] = false; // standardmäßig geschlossen
  }
});

console.log(`🦊 Slyke Playground\nErlaubte Fenster: ${maxWindows}\n`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function showPlayground() {
  console.log("\n----- Aktuelle Fenster -----");
  for (let i = 1; i <= maxWindows; i++) {
    const offen = windowState[i];
    console.log(
      `[${offen ? "🟢" : "🔴"}] Fenster ${i} – ${offen ? "OFFEN" : "ZU"}`
    );
    if (offen && windowComponents[i]) {
      console.log("  Sichtbare Komponenten:", windowComponents[i].join(", "));
    }
  }
  askAction();
}

function askAction() {
  rl.question(
    "\nWas möchtest du tun?\n" + "(open [Nr], close [Nr], exit): ",
    (answer) => {
      const openMatch = answer.match(/^open\s+(\d+)/);
      const closeMatch = answer.match(/^close\s+(\d+)/);
      if (openMatch) {
        const nr = Number(openMatch[1]);
        if (nr > 0 && nr <= maxWindows) {
          windowState[nr] = true;
          console.log(`Fenster ${nr} geöffnet.`);
        } else {
          console.log("Ungültige Fensternummer!");
        }
      } else if (closeMatch) {
        const nr = Number(closeMatch[1]);
        if (nr > 0 && nr <= maxWindows) {
          windowState[nr] = false;
          console.log(`Fenster ${nr} geschlossen.`);
        } else {
          console.log("Ungültige Fensternummer!");
        }
      } else if (answer === "exit") {
        rl.close();
        return;
      } else {
        console.log("Unbekannter Befehl.");
      }
      showPlayground();
    }
  );
}

showPlayground();
