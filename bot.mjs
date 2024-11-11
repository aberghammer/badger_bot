import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import jsonData from "./leoCatsOutput.json" assert { type: "json" };

const __filename = fileURLToPath(import.meta.url);

dotenv.config();

function getObjectById(id) {
  return jsonData.find((nft) => nft.id === id.toString()) || null;
}

if (!process.env.LEO_TOKEN) {
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

function createEmbed(data) {
  const imageUrl = `https://images.gamma.io/ipfs/QmaXmJEnvZ43WYgcEW3KS9E9w3XJgcuH34wdKSXjCMz4ZD/images/${data.id}.png`;

  const embed = new EmbedBuilder()
    .setColor(embedColor)
    .setTitle(data.meta.name) // Nur der Titeltext
    .setURL(`https://stacks.gamma.io/collections/leo-cats/${data.id}`)
    .setThumbnail(imageUrl)
    .setImage(imageUrl)
    .setTimestamp()
    .setDescription(`[high-res image](${imageUrl})`)
    .setFooter({ text: footerText, iconURL: footerIconURL });

  data.meta.attributes.forEach((attr) => {
    embed.addFields({
      name: attr.trait_type,
      value: attr.value,
      inline: attr.trait_type.length > 8 ? false : true,
    });
  });

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
      const data = getObjectById(command);
      if (!data) throw new Error("Leo Cat not found");

      const embed = createEmbed(data);

      await message.channel.send({
        embeds: [embed],
      });
    } catch (error) {
      console.error("Error:", error);
      await message.channel.send("No Leo Cat found.");
    }
  }
});

client.login(process.env.LEO_TOKEN);
