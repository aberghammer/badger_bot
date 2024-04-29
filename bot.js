const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const jsonData = require("./badgersOutput.json");
require("dotenv").config();

function getObjectByNumber(number) {
  if (number < 1 || number > jsonData.length) {
    return null;
  }
  return jsonData[number - 1];
}

if (!process.env.BOT_TOKEN) {
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
  const imageUrl = `https://ordiscan.com/content/${data.id}`;
  const ordiUrl = `https://magiceden.io/ordinals/item-details/${data.id}`;

  // console.log("image", imageUrl);

  const embed = new EmbedBuilder()
    .setColor(embedColor)
    .setTitle(`${data.meta.name}`)
    .setThumbnail(imageUrl)
    .setImage(imageUrl)
    .setTimestamp()
    .setURL(ordiUrl)
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
      const data = getObjectByNumber(command);
      // console.log(data);

      const embed = createEmbed(data);
      // console.log(embed);
      try {
        await message.channel.send({ embeds: [embed] });
      } catch (sendError) {
        console.error("Error sending message:", sendError);

        if (sendError.code === 50013) {
          console.error("Missing permissions to send in this channel");
        }
      }
    } catch (error) {
      console.error("Error getting data:", error);
      await message.channel.send("No Badger found.");
    }
  }
});

client.login(process.env.BOT_TOKEN);
