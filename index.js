require("dotenv/config");
const { Client, IntentsBitField } = require("discord.js");
const { Configuration, OpenAIApi } = require("openai");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("ready", () => {
  console.log("ChatGPT est maintenant connecté");
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== process.env.CHANNEL_ID) return;
  if (message.content.startsWith("!")) return;

  let conversationLog = [
    { role: "system", content: "You are a mean chatbot." },
  ];

  await message.channel.sendTyping();

  let prevMessages = await message.channel.messages.fetch({ limit: 15 });
  prevMessages.reverse();

  prevMessages.forEach((msg) => {
    if (message.content.startsWith("!")) return;
    if (msg.author.id !== client.user.id && message.author.bot) return;
    if (msg.author.id !== message.author.id) return;

    conversationLog.push({
      role: "user",
      content: msg.content,
    });
  });

  try {
    const result = await openai.createChatCompletion({
      model: process.env.AI_MODEL,
      messages: conversationLog,
    });

    return message.reply(result.data.choices[0].message);
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
      return sendError(message, error.response.data.error.message);
    } else {
      console.log(error.message);
      return sendError(message, error.message.toString());
    }
  }
});

const sendError = (messageInfo, content) => {
  return messageInfo.reply(content);
};

client.login(process.env.DISCORD_TOKEN);
