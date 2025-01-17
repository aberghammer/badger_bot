import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import dotenv from "dotenv";
import jsonData from "./nfts_with_rarity_ranking.json" with { type: "json" };

dotenv.config();

function getObjectByNumber(number) {
  return jsonData.find((nft) => nft.number === Number(number)) || null;
}

if (!process.env.FRUG_TOKEN) {
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

async function createEmbed(data) {
  const ordiUrl = `https://magiceden.io/ordinals/item-details/${data.id}`;
  const imageUrl = `https://bis-ord-renders.fra1.cdn.digitaloceanspaces.com/renders/${data.id}.png`;


  // Maximale Länge von `trait_type` berechnen
  const maxTraitLength = Math.max(
    ...data.meta.attributes.map((attr) => attr.trait_type.length)
  );

  // Attribute mit fester Einrückung formatieren
  const attributesList = data.meta.attributes
    .map((attr) => {
      const paddedTrait = attr.trait_type.padEnd(maxTraitLength); // Feste Breite für den Typ
      return `• ${paddedTrait}: ${attr.value}`;
    })
    .join("\n");

  // Embed erstellen
  const embed = new EmbedBuilder()
    .setColor(embedColor)
    .setTitle(`${data.meta.name}`)
    .setImage(imageUrl) // Verwende die dynamische URL
    .setTimestamp()
    .setURL(ordiUrl)
    .setFooter({ text: footerText, iconURL: footerIconURL });

  // Felder formatieren
  embed.addFields(
    {
      name: "💎 Rarity Rank",
      value: `\`\`\`${data.rank}\`\`\``,
      inline: true,
    },
    {
      name: "📜 Attributes",
      value: `\`\`\`\n${attributesList || "No attributes available"}\n\`\`\``,
      inline: false,
    }
  );

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

      const embed = await createEmbed(data);

      await message.channel.send({
        embeds: [embed],
      });
    } catch (error) {
      console.error("Error:", error);
      await message.channel.send("No Frug found.");
    }
  }
});

client.login(process.env.FRUG_TOKEN);