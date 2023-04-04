require("dotenv/config");

const fs = require("node:fs");
const path = require("node:path");

const { Client, IntentsBitField, Collection, Events } = require("discord.js");

const { checkIdExists, updateConversation } = require("./db-initalize");
const { replyToPrompt } = require("./openai/chatgpt");
const { sliceChat, sendError } = require("./discord/chat_function");

// Initialize Discord client
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
  presence: {
    activities: [
      {
        name: "Enjoy la vie!",
        type: "PLAYING",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    ],
  },
});

// Set up commands
client.commands = new Collection();

const commandPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filepath = path.join(commandPath, file);
  const command = require(filepath);

  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`Command ${file} is missing data or execute.`);
  }
}

// Handle slash commands
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

// Handle messages
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const isAKnowThread = await checkIdExists(message.channelId);
  if (!isAKnowThread) return;

  if (message.content.startsWith("!")) return;

  await message.channel.sendTyping();

  await updateConversation(message.channelId, {
    role: "user",
    content: message.content,
  });

  const reply = await replyToPrompt(message.channelId);

  if (typeof reply !== "object") {
    return await sendError(message, reply.error);
  }

  await updateConversation(message.channelId, reply);

  const messageLengthControl = await sliceChat(reply.content);

  if (typeof messageLengthControl === "object") {
    for (let j = 0; j < messageLengthControl.length; j++) {
      await message.channel.send(messageLengthControl[j]);
    }
    return;
  } else {
    return await message.channel.send(messageLengthControl);
  }
});

// Notify when the bot is ready
client.on("ready", () => {
  client.channels.cache
    .get(process.env.CHANNEL_ID)
    .send("ChatGPT est maintenant prêt à répondre aux messages !");
});

//Log the bot in
client.login(process.env.DISCORD_TOKEN);
