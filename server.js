

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const rooms = {};

io.on("connection", (socket) => {
  socket.on("createRoom", () => {
    const code = Math.random().toString(36).slice(2, 7).toUpperCase();

    rooms[code] = {
      players: [socket.id],
      target: Math.floor(Math.random() * 100) + 1,
      guesses: 0
    };

    socket.join(code);
    socket.emit("roomCreated", code);
  });

  socket.on("joinRoom", (code) => {
    code = String(code || "").trim().toUpperCase();
    const room = rooms[code];

    if (!room) {
      socket.emit("gameMessage", "Kodi nuk u gjet.");
      return;
    }

    if (room.players.length >= 2) {
      socket.emit("gameMessage", "Dhoma është plot.");
      return;
    }

    room.players.push(socket.id);
    socket.join(code);
    io.to(code).emit("gameMessage", "Të dy lojtarët janë lidhur!");
  });

  socket.on("guess", ({ code, number }) => {
    code = String(code || "").trim().toUpperCase();
    const room = rooms[code];
    const guess = Number(number);

    if (!room || !room.players.includes(socket.id)) return;
    if (!Number.isInteger(guess) || guess < 1 || guess > 100) {
      socket.emit("gameMessage", "Shkruaj një numër nga 1 deri në 100.");
      return;
    }

    room.guesses++;

    if (guess === room.target) {
      io.to(code).emit("gameMessage", `U gjet numri ${room.target}! Loja mbaroi.`);
      delete rooms[code];
    } else {
      socket.emit(
        "gameMessage",
        guess < room.target ? "Provo një numër më të madh!" : "Provo një numër më të vogël!"
      );
    }
  });

  socket.on("disconnect", () => {
    for (const [code, room] of Object.entries(rooms)) {
      if (room.players.includes(socket.id)) {
        io.to(code).emit("gameMessage", "Një lojtar u shkëput.");
        delete rooms[code];
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Number Duel po punon në portën ${PORT}`);
});

