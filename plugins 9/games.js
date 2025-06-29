const { cmd } = require("../command");

// Word Chain Game (lib/wcg.js exports the class)
const WordChainGame = require("../lib/wcg");
const wcg = new WordChainGame();

// Tic‑Tac‑Toe (lib/ttt.js exports the class)
const TicTacToe = require("../lib/ttt");
const ttt = new TicTacToe();

// Trivia (lib/trivia.js exports the class)
const TriviaGame = require("../lib/trivia");
const triviaGame = new TriviaGame();

// Your Mongo helper & newsletter context
const { connectDB } = require("../lib/db");


// Tic‑Tac‑Toe


// Word Chain Game Command
// 1) Start a new Word Chain Game
cmd(
  {
    pattern: "wg",
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
        return reply(
          "A Word Chain game is already in progress!"
        );
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
      return reply(
        "An error occurred while starting the Word Chain game."
      );
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
        return reply(
          "No Word Chain game is in progress. Start one with `wcg`."
        );
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
          return reply("You’ve already joined!" );
        }
      } else {
        return reply("The game is already active — just play your turn!");
      }
    } catch (err) {
      console.error(err);
      return reply(
        "An error occurred while joining the Word Chain game."
      );
    }
  }
);

 // Make sure this is instantiated correctly at the top

cmd(
  {
    pattern: "ttt",
    desc: "Start a Tic Tac Toe game.",
    category: "games",
    react: "❌⭕",
    filename: __filename,
  },
  async (conn, mek, m, { from, reply }) => {
    try {
      const chatId = m.chat;
      let game = ttt.getGame(chatId);
      
      // Check if a game is already in progress
      if (game && game.status !== "ended") {
        return reply("A Tic Tac Toe game is already in progress!\n" + game.renderBoard() );
      }

      // If no game exists, create a new one
      game = ttt.createGame(chatId);
      const symbol = game.addPlayer(m.sender);

      return reply(
        `*_TicTacToe Started!_*\n\n1. Use 1-9 to place your mark\n2. Get 3 in a row to win\n\n${m.sender} as ${symbol}\nType "join" to play!\n\n${game.renderBoard()}`
     );
    } catch (error) {
      console.error(error);
      return reply("An error occurred while starting the Tic Tac Toe game.");
    }
  }
);

// Tic-Tac-Toe Join Command
cmd(
  {
    pattern: "join",
    desc: "Join a Tic Tac Toe game.",
    category: "games",
    react: "❌⭕",
    filename: __filename,
  },
  async (conn, mek, m, { from, reply }) => {
    try {
      const chatId = m.chat;
      const game = ttt.getGame(chatId);

      if (!game) return reply("No Tic Tac Toe game is in progress.");

      const text = m.text.toLowerCase();
      if (text === "join" && game.status === "waiting") {
        const symbol = game.addPlayer(m.sender);
        if (symbol) {
          return reply(`${m.sender} joined as ${symbol}\nGame starts now!\n\n${game.players.X} (X) goes first\n${game.renderBoard()}`);
        }
      }

      if (game.status === "active") {
        const position = parseInt(text);
        if (isNaN(position)) return;

        const result = game.makeMove(m.sender, position);
        if (!result.valid) return reply(result.reason);

        if (result.gameEnd) {
          ttt.deleteGame(chatId);
          if (result.reason === "win") {
            return reply(`*_Game Over! ${m.sender} wins!_*\n\n` + game.renderBoard() );
          } else {
            return reply("*_Game Over! It's a draw!_*\n\n" + game.renderBoard() );
          }
        }

        return reply(`${m.sender} placed ${game.currentTurn === "X" ? "O" : "X"} at position ${position}\n${game.players[game.currentTurn]}'s turn (${game.currentTurn})\n\n${game.renderBoard()}`, );
      }
    } catch (error) {
      console.error(error);
      return reply("An error occurred while joining the Tic Tac Toe game.");
    }
  }
);

// Trivia Game Command
cmd(
  {
    pattern: "trivia ?(.*)",
    desc: "Play Trivia Game (easy/medium/hard)",
    category: "games",
    react: "🧠",
    filename: __filename,
  },
  async (conn, mek, m, { from, reply }) => {
    try {
      const chatId = m.chat;
      const difficulty = m.text.split(" ")[1];
      if (triviaGame.isGameActive(chatId)) return reply("*_A trivia game is already in progress! Answer the current question or use \"trivia end\" to end it._*");
      
      if (!['easy', 'medium', 'hard'].includes(difficulty)) return reply('*_Choose difficulty: easy, medium, or hard_*');
      
      const questionMsg = await triviaGame.startGame(chatId, difficulty);
      await reply(questionMsg);
    } catch (error) {
      console.error(error);
      return reply("An error occurred while starting the trivia game.");
    }
  }
);

// Trivia Answer Command
cmd(
  {
    pattern: "answer ?(.*)",
    desc: "Answer a trivia question.",
    category: "games",
    react: "🧠",
    filename: __filename,
  },
  async (conn, mek, m, { from, reply }) => {
    try {
      const chatId = m.chat;
      const userAnswer = m.text.split(" ")[1];
      if (!triviaGame.isGameActive(chatId)) return;

      const game = triviaGame.activeGames.get(chatId);
      if (!game) return;

      const result = triviaGame.checkAnswer(chatId, userAnswer);
      if (result.includes("Correct!")) {
        await reply(result, );
        setTimeout(async () => {
          if (triviaGame.isGameActive(chatId)) {
            const newQuestion = await triviaGame.startGame(chatId, game.difficulty);
            await reply(newQuestion);
          }
        }, 2000);
      } else {
        await reply(result);
      }
    } catch (error) {
      console.error(error);
      return reply("An error occurred while answering the trivia question.");
    }
  }
);
            
