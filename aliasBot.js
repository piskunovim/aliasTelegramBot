import TelegramBot from "node-telegram-bot-api";

import {
  parseMessage,
  isGroupChat,
  isNoDrawer,
  joinPlayer,
  showMenu,
  showScores,
  getRandomWord
} from "./helpers";

export const initBot = () => {
  const bot = new TelegramBot(process.env.ALIAS_BOT_TOKEN, { polling: true });

  const games = {};

  bot.onText(/\/start/, (msg) => {
    const player = parseMessage(msg);

    if (!isGroupChat(msg)) {
      bot.sendMessage(
        msg.chat.id,
        "Добро пожаловать! Данная игра спроектирована только для игры в группах. Пожалуйста, добавьте бота к группе ваших друзей для начала работы."
      );
      return;
    }

    if (!games[player.chatId]) {
      games[player.chatId] = {
        word: null,
        players: [],
        scores: {},
        drawer: null
      };

      bot.sendMessage(player.chatId, "Игра Alias начата!");
      joinPlayer(player, games[player.chatId]);

      showMenu({
        bot,
        chatId: player.chatId,
        game: games[player.chatId]
      });
      return;
    }
  });

  bot.on("callback_query", (query) => {
    const chatId = query.message.chat.id;
    const fromUserId = query.from.id;

    if (!games[chatId]) {
      bot.sendMessage(
        chatId,
        `В настоящий момент игра не начата, пожалуйста используйте команду /start, чтобы начать играть.`
      );
      return;
    }

    switch (query.data) {
      case "new_game": {
        if (games[chatId].drawer) {
          return games[chatId].drawer.userId === fromUserId
            ? bot.answerCallbackQuery(query.id, {
                text: 'Вы уже объясняете слово. Команда "/reset", чтобы сбросить игру',
                show_alert: true
              })
            : bot.answerCallbackQuery(query.id, {
                text: `Игрок ${games[chatId].drawer.username} объясняет слово. Команда "/reset", чтобы сбросить игру`,
                show_alert: true
              });
        }

        const drawer = games[chatId].players.find(
          ({ userId }) => userId === fromUserId
        );
        const word = getRandomWord();

        games[chatId].word = word;
        games[chatId].drawer = drawer;

        showMenu({
          bot,
          chatId,
          title: `Игра началась! ${drawer.username} объясняет слово. Остальные игроки могут писать свои догадки в чате.`,
          game: games[chatId]
        });

        break;
      }
      case "check_the_word": {
        if (isNoDrawer({ bot, game: games[chatId], queryId: query.id })) {
          return;
        }

        let text = `Сейчас слово объясняет игрок ${games[chatId].drawer.username}`;
        if (games[chatId].drawer.userId === fromUserId) {
          text = `Ваше слово: ${games[chatId].word}`;
        }

        bot.answerCallbackQuery(query.id, { text, show_alert: true });
        break;
      }
      case "skip_the_word": {
        if (isNoDrawer({ bot, game: games[chatId], queryId: query.id })) {
          return;
        }

        let text = `Сейчас слово объясняет игрок ${games[chatId].drawer.username}`;
        if (games[chatId].drawer.userId === fromUserId) {
          const word = getRandomWord();
          games[chatId].word = word;
          text = `Новое слово: ${games[chatId].word}`;
        }

        bot.answerCallbackQuery(query.id, { text, show_alert: true });
        break;
      }
      default:
        break;
    }
  });

  bot.on("message", (msg) => {
    const player = parseMessage(msg);
    const text = msg.text;

    const currentGame = games[player.chatId];

    joinPlayer(player, currentGame);

    if (!currentGame) {
      return;
    }

    const currentWord = currentGame.word;

    if (
      currentGame &&
      currentWord &&
      currentGame.drawer.userId !== player.userId &&
      text.toLowerCase() === currentWord.toLowerCase()
    ) {
      currentGame.scores[player.userId]++;
      currentGame.word = "";
      currentGame.drawer = "";

      showMenu({
        bot,
        chatId: player.chatId,
        title: `${player.username} угадал! Загаданное слово было ${currentWord}. Посмотреть счет /scores.`,
        game: currentGame
      });
    }
  });

  bot.onText(/\/scores/, (msg) => {
    const chatId = msg.chat.id;

    showScores({
      bot,
      chatId,
      game: games[chatId]
    });
  });

  bot.onText(/\/player_reset/, (msg) => {
    const chatId = msg.chat.id;

    games[chatId].word = "";
    games[chatId].drawer = "";

    showMenu({
      bot,
      chatId,
      game: games[chatId]
    });
  });

  bot.onText(/\/game_reset/, (msg) => {
    const chatId = msg.chat.id;

    games[chatId].word = "";
    games[chatId].drawer = "";

    for (const player of games[chatId].players) {
      games[chatId].scores[player.userId] = 0;
    }

    showMenu({
      bot,
      chatId,
      game: games[chatId]
    });
  });

  bot.on("polling_error", console.log);
};
