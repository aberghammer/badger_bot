import sharp from "sharp";
import fs from "fs";
import path from "path";

// Ursprungs- und Zielordner definieren
const inputDir = path.join(process.cwd(), "images");
const outputDir = path.join(process.cwd(), "compressed");

// Erstelle den Zielordner, falls er nicht existiert
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Bildkompressionseinstellungen
const width = 200; // Breite des Thumbnails, z. B. 128 Pixel
const quality = 80; // JPEG-Qualität, z. B. 80%

async function compressImages() {
  const files = fs.readdirSync(inputDir);

  for (const file of files) {
    const inputFilePath = path.join(inputDir, file);
    const outputFilePath = path.join(outputDir, file);

    try {
      await sharp(inputFilePath)
        .resize({ width }) // Thumbnail-Größe anpassen
        .jpeg({ quality }) // JPEG-Komprimierung anwenden
        .toFile(outputFilePath);

      console.log(`Bild komprimiert und gespeichert unter: ${outputFilePath}`);
    } catch (error) {
      console.error(`Fehler bei der Komprimierung von ${file}:`, error);
    }
  }
}

compressImages();
