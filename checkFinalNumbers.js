const fs = require("fs");

const jsonFilePath = "nfts_with_rarity_ranking.json";

// JSON-Datei einlesen
fs.readFile(jsonFilePath, "utf8", (err, jsonString) => {
  if (err) {
    console.log("Fehler beim Lesen der Datei:", err);
    return;
  }
  try {
    const data = JSON.parse(jsonString);
    data.forEach((item) => {
      const nameNumberMatch = item.meta.name.match(/#(\d+)$/);
      if (nameNumberMatch) {
        const nameNumber = parseInt(nameNumberMatch[1], 10);
        if (nameNumber !== item.number) {
          console.log(
            `Nummern stimmen nicht überein für ID ${item.id}: Name-Nummer ${nameNumber} !== Nummer ${item.number}`
          );
        }
      } else {
        console.log(`Keine Nummer im Namen gefunden für ID ${item.id}`);
      }
    });
  } catch (err) {
    console.log("Fehler beim Parsen des JSON:", err);
  }
});
