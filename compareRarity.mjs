import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname in ES-Modulen definieren
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dateipfade anpassen
const rarityJsonPath = path.join(__dirname, "rarity.json");
const nftsJsonPath = path.join(__dirname, "nfts_with_rarity_ranking.json");

// Dateien einlesen
const rarityJson = JSON.parse(fs.readFileSync(rarityJsonPath, "utf-8"));
const nftsJson = JSON.parse(fs.readFileSync(nftsJsonPath, "utf-8"));

// Unterschiede finden
const differences = [];

nftsJson.forEach((nft) => {
  const matchingRarityItem = rarityJson.find(
    (rarityItem) => rarityItem.inscription === nft.id
  );

  if (matchingRarityItem) {
    if (nft.rank !== matchingRarityItem.rank) {
      differences.push({
        id: nft.id,
        nftsRank: nft.rank,
        rarityRank: matchingRarityItem.rank,
      });
    }
  } else {
    differences.push({
      id: nft.id,
      nftsRank: nft.rank,
      rarityRank: "Not found in rarity.json",
    });
  }
});

// Ergebnisse ausgeben
if (differences.length > 0) {
  console.log("Unterschiede in den Rank-Werten gefunden:");
  console.table(differences);
} else {
  console.log("Keine Unterschiede in den Rank-Werten gefunden.");
}
