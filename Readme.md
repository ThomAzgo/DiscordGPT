# DiscordGPT - OpenAI website adaptation for Discord

This bot discord is an adaptation of the chat part of the OPENAI site for discord.
You can start a conversation with the `/initiate` command, this will create a discord thread where you can chat with the bot.

## Installation

### Docker

#### Requirements

- Docker
- Docker Compose

#### Setup

1. Copy .env.dist to .env and fill in the values.
2. Simply run the following command:

   ```bash
   docker-compose up -d
   ```

   This will start the bot and the database.

### Manual

#### Requirements

- NodeJS 16.9+

#### Setup

1. Copy .env.dist to .env and fill in the values.
2. Install the dependencies:

   ```bash
   npm install
   ```

3. Register the slash commands:

   ```bash
   npm run deploy-commands
   ```

4. Start the bot:

   ```bash
    npm start
   ```
