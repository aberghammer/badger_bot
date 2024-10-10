const fs = require("fs");

// const nfts = JSON.parse(fs.readFileSync("nfts_with_numbers.json", "utf8"));
const nfts = JSON.parse(fs.readFileSync("nfts_with_numbers.json", "utf8"));

const attributeCounts = {};
nfts.forEach((nft) => {
  nft.meta.attributes.forEach((attr) => {
    const key = `${attr.trait_type}:${attr.value}`;
    if (!attributeCounts[key]) {
      attributeCounts[key] = 0;
    }
    attributeCounts[key]++;
  });
});

nfts.forEach((nft) => {
  let rarity = 0;
  nft.meta.attributes.forEach((attr) => {
    const key = `${attr.trait_type}:${attr.value}`;
    rarity += 1 / attributeCounts[key];
  });
  nft.rarity = rarity;
});

nfts.sort((a, b) => b.rarity - a.rarity);

nfts.forEach((nft, index) => {
  nft.rank = index + 1;
});

fs.writeFileSync(
  "nfts_with_rarity_ranking.json",
  JSON.stringify(nfts, null, 2)
);
