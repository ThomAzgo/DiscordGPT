const openaiGptTokenCounter = require("openai-gpt-token-counter");

const { getConversation } = require("../db-initalize");
const { OpenAI } = require("../openai/Initiate");

const TOKEN_LIMIT = parseInt(process.env.AI_TOKEN_LIMIT) || 4097;

const replyToPrompt = async (thread_id) => {
  let conversation = await getConversation(thread_id);
  let conversation_log_from_db = conversation.conversation_log;

  conversation_log_from_db = await JSON.parse(conversation_log_from_db);

  conversation_log_from_db = await limitTokenSize(conversation_log_from_db);

  try {
    const result = await OpenAI.createChatCompletion({
      model: process.env.AI_MODEL,
      messages: conversation_log_from_db,
    });

    const res = result.data.choices[0].message;
    return res;
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
      return error.response.data.error.message;
    } else {
      console.log(error.message);
      return error.message.toString();
    }
  }
};

const limitTokenSize = (context) => {
  let contextSizeInTokens = openaiGptTokenCounter(JSON.stringify(context));

  while (contextSizeInTokens > TOKEN_LIMIT) {
    context.shift();
    contextSizeInTokens = openaiGptTokenCounter(JSON.stringify(context));
  }

  return context;
};

module.exports = { replyToPrompt };
