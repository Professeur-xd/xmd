const { cmd } = require("../command");
const WordChainGame = require("../lib/wcg");
const wcg = new WordChainGame();

// 1) Start Easy mode
// 1) Start a new Word Chain Game
cmd(
  {
    pattern: "wcg",
    desc: "Start a Word Chain Game.",
    category: "games",
    react: "🧩",
    filename: __filename,
  },
  async (conn, mek, m, { reply, args }) => {
    try {
      const chatId = m.chat;
      let game = wcg.getGame(chatId);

      if (game && game.status === "active") {
        return reply("A Word Chain game is already in progress!");
      }

      // The first arg after the command is our difficulty
      const diff = args[0]?.toLowerCase();
      const difficulty = ["easy", "medium", "hard"].includes(diff) ? diff : "medium";

      game = wcg.createGame(chatId, difficulty);
      game.addPlayer(m.sender);

      return reply(
        `Word Chain Game started (${difficulty} mode)!  
Minimum word length: ${game.minLength} letters  
Time per turn: ${game.turnTime} seconds  

Type "join" to participate. Game starts when at least 2 players join.`
      );
    } catch (err) {
      console.error(err);
      return reply("An error occurred while starting the Word Chain game.");
    }
  }
);

// 2) Join / trigger start when enough players
cmd(
  {
    pattern: "join",
    desc: "Join the Word Chain game.",
    category: "games",
    react: "🧩",
    filename: __filename,
  },
  async (conn, mek, m, { reply }) => {
    try {
      const chatId = m.chat;
      const game = wcg.getGame(chatId);
      if (!game) {
        return reply("No Word Chain game is in progress. Start one with `wcg`.");
      }

      if (game.status === "waiting") {
        if (game.addPlayer(m.sender)) {
          await reply("You joined the game! Waiting for more players...");
          if (game.players.size >= 2) {
            game.start();
            return reply(
              `Game started!  
First player: @${game.currentPlayer.split("@")[0]}'s turn.  
Start with any word of at least ${game.minLength} letters.  
You have ${game.turnTime} seconds per turn.`,
              {
                mentions: [ game.currentPlayer ]
              }
            );
          }
        } else {
          return reply("You’ve already joined!");
        }
      } else {
        return reply("The game is already active — just play your turn!");
      }
    } catch (err) {
      console.error(err);
      return reply("An error occurred while joining the Word Chain game.");
    }
  }
);
