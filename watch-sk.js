const chokidar = require("chokidar");
const { exec } = require("child_process");

// NUR Watcher! Keine Namens- oder Komponentenlogik!
const watcher = chokidar.watch("components/**/*.sk", { ignoreInitial: false });

console.log("Warte auf Änderungen an .sk-Dateien im components/ Ordner...");

watcher.on("add", convert).on("change", convert);

function convert(filePath) {
  console.log(`[SK] ${filePath} geändert → konvertiere...`);
  exec(`node sk2jsx.js "${filePath}"`, (err, stdout, stderr) => {
    if (err) return console.error(`[SK-ERROR]`, stderr);
    if (stdout) console.log(stdout);
  });
}
