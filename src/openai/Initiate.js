const { Configuration, OpenAIApi } = require("openai");

// Set up OPENAI API
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

const OpenAI = openai;

module.exports = { OpenAI };
