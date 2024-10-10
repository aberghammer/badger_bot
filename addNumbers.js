const fs = require("fs");

const nfts = JSON.parse(fs.readFileSync("based_angels.json", "utf8"));

nfts.forEach((nft, index) => {
  nft.number = index + 1;
});

fs.writeFileSync("nfts_with_numbers.json", JSON.stringify(nfts, null, 2));
