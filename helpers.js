import { generalDictionary } from "./dictionary";

export const parseMessage = (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username || msg.from.first_name || userId;

  return { chatId, userId, username };
};

export const isGroupChat = (msg) => {
  if (msg.chat.type !== "group" && msg.chat.type !== "supergroup") {
    return false;
  }

  return true;
};

export const isNoDrawer = ({ bot, queryId, game }) => {
  if (!game.drawer) {
    bot.answerCallbackQuery(queryId, {
      text: "Сейчас у игры нет ведущего. Введите /start, чтобы начать.",
      show_alert: true
    });
    return true;
  }
  return false;
};

export const joinPlayer = (player, game) => {
  const { chatId, userId, username } = player;
  if (game) {
    if (!game.players.find(({ userId: playerId }) => userId === playerId)) {
      game.players.push({ userId, username });
      game.scores[userId] = 0;
    }
  }
};

export const showMenu = ({ bot, chatId, title = "Меню игры", game }) => {
  let inline_keyboard = [
    [{ text: "Хочу быть ведущим!", callback_data: "new_game" }]
  ];

  if (game && game.word) {
    inline_keyboard = [
      [{ text: "Посмотреть слово", callback_data: "check_the_word" }],
      [{ text: "Новое слово", callback_data: "skip_the_word" }]
    ];
  }

  bot.sendMessage(chatId, title, { reply_markup: { inline_keyboard } });
};

export const showScores = ({ bot, chatId, game }) => {
  if (game) {
    let scoresMessage = "Общий счет:\n";

    for (const player of game.players) {
      const username = player.username;
      scoresMessage += `${username}: ${game.scores[player.userId]}\n`;
    }

    bot.sendMessage(chatId, scoresMessage);
  } else {
    bot.sendMessage(chatId, "Нет активных игр.");
  }
};

export const getRandomWord = () => {
  const randomIndex = Math.floor(Math.random() * generalDictionary.length);
  return generalDictionary[randomIndex];
};
