require("dotenv/config");

const { SlashCommandBuilder } = require("discord.js");
const {
  updateConversation,
  checkIdExists,
  insertConversation,
} = require("../db-initalize");

const { replyToPrompt } = require("../openai/chatgpt");

const { sliceChat } = require("../discord/chat");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("initiate")
    .setDescription("Start a conversation with ChatGpt!")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("The prompt for the conversation.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("attitude")
        .setDescription("The attitude of the bot.")
        .addChoices(
          {
            name: "Friendly",
            value: "You are a friendly person.",
          },
          {
            name: "Neutral",
            value: "You are a neutral person.",
          },
          {
            name: "Aggressive",
            value: "You are a aggressive person.",
          },
          {
            name: "Curious",
            value: "You are a curious person.",
          },
          { name: "Sarcastic", value: "You are a sarcastic person." }
        )
    ),
  async execute(interaction) {
    const prompt = interaction.options.getString("prompt");
    const attitude = interaction.options.getString("attitude")
      ? interaction.options.getString("attitude")
      : process.env.AI_DEFAULT_PERSONALITY;
    const requestedBy = interaction.user.username;

    const name = `${prompt} - ${requestedBy}`;

    const thread = await interaction.channel.threads.create({
      name: `${name}`,
      autoArchiveDuration: 60,
      reason: `${requestedBy} requested a conversation with ChatGpt as a ${attitude} for the prompt: ${prompt}`,
    });

    if (!thread)
      return interaction.reply({
        content:
          "There was an error creating the thread. Please try again later.",
        ephemeral: true,
      });

    const IsExist = await checkIdExists(thread.id);

    if (IsExist)
      return interaction.reply({
        content: `Thread already exists. Please check the thread.`,
        ephemeral: true,
      });

    const conversationAttitude = [
      {
        role: "system",
        content: attitude,
      },
    ];

    const db = await insertConversation(
      thread.id,
      thread.id,
      requestedBy,
      prompt,
      attitude,
      conversationAttitude
    );

    if (db)
      return interaction.reply({
        content: `There was an error creating the conversation. Please try again later.`,
        ephemeral: true,
      });

    await interaction.reply({
      content: `Conversation started. Please check the thread.`,
      ephemeral: true,
    });

    await updateConversation(thread.id, {
      role: "user",
      content: prompt,
    });

    const reply = await replyToPrompt(thread.id);

    await updateConversation(thread.id, reply);

    const messageLengthControl = await sliceChat(reply.content);

    if (typeof messageLengthControl === "object") {
      for (let j = 0; j < messageLengthControl.length; j++) {
        await thread.send(messageLengthControl[j]);
      }
      return;
    } else {
      return await thread.send({
        content: `${reply.content}`,
      });
    }
  },
};
