import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  AttachmentBuilder,
} from "discord.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import jsonData from "./nfts_with_rarity_ranking.json" assert { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

function getObjectByNumber(number) {
  return jsonData.find((nft) => nft.number === Number(number)) || null;
}

if (!process.env.BASED_ANGELS_TOKEN) {
  console.error("Missing BOT_TOKEN in environment variables");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const embedColor = 0x0099ff;
const footerText = "made by andi with lots of ❤️";
const footerIconURL =
  "https://berghammer.dev/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FLogo_Name_Color_Black.f1c14d24.png&w=64&q=75";

function createEmbed(data, imageName) {
  const ordiUrl = `https://magiceden.io/ordinals/item-details/${data.id}`;

  const originalImageUrl = data.meta.high_res_img_url;

  const embed = new EmbedBuilder()
    .setColor(embedColor)
    .setTitle(`${data.meta.name}`)
    .setThumbnail(`attachment://${imageName}.png`)
    .setImage(`attachment://${imageName}.png`)
    .setTimestamp()
    .setURL(ordiUrl)
    .setDescription(`[high-res image](${originalImageUrl})`)
    .setFooter({ text: footerText, iconURL: footerIconURL });

  data.meta.attributes.forEach((attr) => {
    embed.addFields({
      name: attr.trait_type,
      value: attr.value,
      inline: attr.trait_type.length > 8 ? false : true,
    });
  });

  // embed.addFields({
  //   name: "Rank (Unofficial)",
  //   value: String(data.rank),
  //   inline: true,
  // });

  return embed;
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot || !message.content.startsWith("!"))
    return;

  const command = message.content.slice(1);
  if (/^\d+$/.test(command)) {
    try {
      const data = getObjectByNumber(command);
      if (!data) throw new Error("NFT not found");

      const compressedImagePath = path.join(
        __dirname,
        "compressed",
        `${data.number}.png`
      );

      if (!fs.existsSync(compressedImagePath)) {
        throw new Error("Compressed image not found");
      }

      const imageAttachment = new AttachmentBuilder(compressedImagePath);
      const embed = createEmbed(data, data.number);

      await message.channel.send({
        embeds: [embed],
        files: [imageAttachment],
      });
    } catch (error) {
      console.error("Error:", error);
      await message.channel.send("No Badger found.");
    }
  }
});

client.login(process.env.BASED_ANGELS_TOKEN);
