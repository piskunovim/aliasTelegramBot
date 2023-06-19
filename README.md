# Alias Telegram Game Bot

This is a Telegram bot designed to play the Alias game in group chats. Please note that individual chats are not supported.

## Prerequisites

- Node.js installed on your system.
- A Telegram bot token. You can create a new bot on Telegram by talking to [@BotFather](https://t.me/botfather).

## Setup

1. Clone this repository or download the source code.

   ```sh
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

3. Set the environment variable ALIAS_BOT_TOKEN with your Telegram bot token.

For Windows:

   ```sh
   set ALIAS_BOT_TOKEN=your-telegram-bot-token
   ```

For MacOS/Linux:

   ```sh
   export ALIAS_BOT_TOKEN=your-telegram-bot-token
   ```

## Running the Bot

1. Start the bot using the following command:

   ```sh
   npm start
   ```

2. Add the bot to a Telegram group chat.

3. Type `/start` in the group chat to initialize the bot.

4. Have fun playing the Crocodile game!

## Notes

- The bot is intended for use in group chats only. It does not support individual chats.
- When adding the bot to a group chat, you may need to send /start as the first message to initialize the bot.

## License

MIT
