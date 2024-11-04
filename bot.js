const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
const jsonData = require("./nfts_with_rarity_ranking.json");
require("dotenv").config();

function getObjectByNumber(number) {
  return jsonData.find((nft) => nft.number === Number(number)) || null;
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

async function createEmbed(data) {
  const queryBadger = await fetch(
    `https://badgers.club/api/badgers/${data.number}`
  );
  const badger = await queryBadger.json();

  const params = {
    background: badger.background.image,
    body: badger.body.image,
    claws: badger.claws.image,
    mane: badger.mane.image,
    eyes: badger.eyes.image,
    artifact: badger.artifact.image,
    headgear: badger.headgear.image,
  };

  const queryString = new URLSearchParams(params).toString();

  const gifUrl = `https://badgers.club/api/images?${queryString}&animated=true`;
  const imageUrl = `https://badgers.club/api/images?${queryString}`;
  const magicEdenUrl = `https://magiceden.io/ordinals/item-details/${data.id}`;

  const gifResponse = await fetch(gifUrl);
  const gifArrayBuffer = await gifResponse.arrayBuffer();
  const gifBuffer = Buffer.from(gifArrayBuffer);
  const gifAttachment = new AttachmentBuilder(gifBuffer, {
    name: "badger.gif",
    description: `Animated image of Badger #${data.number}`,
  });

  const imageResponse = await fetch(imageUrl);
  const imageArrayBuffer = await imageResponse.arrayBuffer();
  const imageBuffer = Buffer.from(imageArrayBuffer);
  const imageAttachment = new AttachmentBuilder(imageBuffer, {
    name: "badger.png",
    description: `Image of Badger #${data.number}`,
  });

  const embed = new EmbedBuilder()
    .setColor(embedColor)
    .setTitle(`${data.meta.name}`)
    .setThumbnail("attachment://badger.png")
    .setImage("attachment://badger.gif")
    .setTimestamp()
    .setURL(`https://badgers.club/badgers/${data.number}`)
    .setDescription("[Magic Eden](" + magicEdenUrl + ")")
    .setFooter({ text: footerText, iconURL: footerIconURL });

  data.meta.attributes.forEach((attr) => {
    embed.addFields({
      name: attr.trait_type,
      value: attr.value,
      inline: attr.trait_type.length > 8 ? false : true,
    });
  });

  embed.addFields({
    name: "Rank (badgers.club)",
    value: String(badger.rank_norm),
    inline: true,
  });

  return { embed, files: [gifAttachment, imageAttachment] };
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

      const { embed, files } = await createEmbed(data);

      console.log(embed);
      try {
        await message.channel.send({ embeds: [embed], files });
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
