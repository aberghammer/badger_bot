import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

// Lade die JSON-Datei ein
const jsonData = JSON.parse(
  fs.readFileSync("nfts_with_rarity_ranking.json", "utf-8")
);

// Ordnerpfad für die Bilder
const imagesDir = path.join(process.cwd(), "images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

async function downloadAllImages() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (const entry of jsonData) {
    const { number, meta } = entry;
    const url = meta.high_res_img_url;

    console.log(`Lade Bild für ${meta.name} (#${number}) von ${url}...`);

    try {
      await page.goto(url, { waitUntil: "networkidle2" });

      // Warte auf das Bild
      const imageSelector = "img";
      await page.waitForSelector(imageSelector);

      // Extrahiere die Bild-URL aus dem `img`-Tag
      const imageUrl = await page.evaluate((imageSelector) => {
        const imgElement = document.querySelector(imageSelector);
        return imgElement ? imgElement.src : null;
      }, imageSelector);

      if (!imageUrl) {
        console.error(`Bild-URL nicht gefunden für #${number}.`);
        continue;
      }

      // Lade das Bild herunter
      const viewSource = await page.goto(imageUrl);
      const buffer = await viewSource.buffer();

      // Speichere das Bild als PNG
      const outputPath = path.join(imagesDir, `${number}.png`);
      fs.writeFileSync(outputPath, buffer);
      console.log(
        `Bild erfolgreich heruntergeladen und gespeichert unter: ${outputPath}`
      );
    } catch (error) {
      console.error(
        `Fehler beim Herunterladen des Bildes für #${number}:`,
        error
      );
    }
  }

  await browser.close();
}

downloadAllImages();
