const fs = require("fs");
const csv = require("csv-parser");

// Pfade für CSV-Datei und Ausgabe-JSON-Datei
const csvFilePath = "leoCats.csv";
const jsonOutputPath = "leoCatsOutput.json";

// Funktion, die CSV-Daten in das gewünschte JSON-Format konvertiert
function convertCsvToJson() {
  let idCounter = 1; // Startet mit Leo Cats #1
  const results = [];

  // Lese die CSV-Datei ein
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (row) => {
      // Konvertiere jede Zeile in das Zielformat
      const formattedRow = {
        id: idCounter.toString(),
        meta: {
          name: `Leo Cats #${idCounter}`,
          attributes: [
            { trait_type: "Background", value: row.Background || "None" },
            { trait_type: "Body", value: row.Base || "None" },
            { trait_type: "Cloth", value: row.Cloth || "None" },
            { trait_type: "Eyes", value: row.Eyes || "None" },
            { trait_type: "Headgear", value: row.Hat || "None" },
            { trait_type: "Mouth", value: row.Mouth || "None" },
          ],
        },
      };

      results.push(formattedRow);
      idCounter++; // Erhöhe den Zähler für die nächste ID
    })
    .on("end", () => {
      // Schreibe die konvertierten Daten in eine JSON-Datei
      fs.writeFile(jsonOutputPath, JSON.stringify(results, null, 2), (err) => {
        if (err) {
          console.error("Fehler beim Schreiben der Datei:", err);
        } else {
          console.log(`JSON-Datei erfolgreich geschrieben: ${jsonOutputPath}`);
        }
      });
    });
}

// Rufe die Funktion auf
convertCsvToJson();
