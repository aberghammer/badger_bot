import { readFileSync, writeFileSync } from "fs";

const nfts = JSON.parse(readFileSync("frugs.json", "utf8"));

nfts.forEach((nft, index) => {
  nft.number = index + 1;
});

writeFileSync("nfts_with_numbers.json", JSON.stringify(nfts, null, 2));
