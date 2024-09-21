const socketIo = require("socket.io");
const gameModel = require("../models/game.model");

let rooms = [];

module.exports = (server, sessionMiddleware) => {
  const io = socketIo(server);

  io.use((socket, next) => {
    const req = socket.handshake;
    const res = {};
    sessionMiddleware(req, res, next);
  });

  io.on("connection", (socket) => {
    console.log("connected to socket server");
    const req = socket.handshake;

    socket.on("create-room", (roomName) => {
      const room = {
        name: roomName,
        creator: req.session.user.login,
        players: [req.session.user.login],
        ready: 0,
      };
      rooms.push(room);
      socket.emit("room-created", room);
    });

    socket.on("send-damage", (sendDamage, login, roomId) => {
      const room = rooms.find((r) => r.name === roomId);
      let damaged;

      for (const player of room.players) {
        if (player !== login) {
          damaged = player;
        }
      }

      io.emit("get-damage", sendDamage.damage, sendDamage.enemyCard, damaged);
    });

    socket.on("send-player-damage", (sender, damage) => {
      io.emit("get-player-damage", sender, damage);
    });

    socket.on("send-remainig-hp", (remainingHp, sender) => {
      io.emit("get-remainig-hp", remainingHp, sender);
    });

    socket.on(
      "send-enemy-card-damaged",
      (damage, damagedCardId, damagedPlayer) => {
        io.emit("get-enemy-card-damaged", damage, damagedCardId, damagedPlayer);
      }
    );

    socket.on("send-login", () => {
      io.emit("get-login", req.session.user.login);
    });

    socket.on("end-game", (loser) => {
      io.emit("game-ended", loser);
    });

    socket.on("get-room", (roomid) => {
      const room = rooms.find((r) => r.name === roomid);
      if (room) {
        socket.emit("get-room-response", room);
      } else {
        socket.emit("get-room-response", null);
      }
    });

    socket.on("find-room", () => {
      io.emit("send-rooms", rooms);
    });

    socket.on("join-room", (roomName) => {
      const room = rooms.find((r) => r.name === roomName);
      if (room) {
        room.players.push(req.session.user.login);
        socket.join(roomName);

        io.emit("room-created", room);
        io.to(roomName).emit("send-players", room.players);
      } else {
        socket.emit("room-not-found", roomName);
      }
    });

    socket.on("get-players", (room) => {
      const temp = rooms.find((r) => r.name === room);
      if (temp) {
        socket.emit("send-players", temp.players);
      } else {
        socket.emit("send-players", null);
      }
    });

    socket.on("player-ready", (room) => {
      const temp = rooms.find((r) => r.name === room);
      if (temp) {
        let playerFound = false;
        for (const player of temp.players) {
          if (player === req.session.user.login) {
            playerFound = true;
            break;
          }
        }
        if (playerFound) {
          temp.ready++;
          io.emit("ready", req.session.user.login);
          const readyPlayers = temp.ready;
          if (readyPlayers <= 2) {
            socket.emit("start-game", room, req.session.user.login);
          }
          if (readyPlayers == 2) {
            io.emit("timer-duration-ready", 4);
            setTimeout(() => io.emit("players-ready"), 5000);
          }
        }
      }
    });

    socket.on("send-enemy", (sender, roomId) => {
      const room = rooms.find((r) => r.name === roomId);
      let enemy = null;

      for (const player of room.players) {
        if (player !== sender) {
          enemy = player;
        }
      }

      io.emit("get-enemy", enemy, sender);
    });

    socket.on("put-card", async (enemyCardId, sender) => {
      try {
        const enemyCard = await gameModel.getOpponentCard(enemyCardId);
        if (enemyCard) {
          io.emit("load-enemy-card", enemyCard, sender);
        }
      } catch (error) {
        console.error("Database error: " + error);
      }
    });

    socket.on("get-card", async (login) => {
      try {
        const randomCard = await gameModel.getCard();
        if (randomCard) {
          io.emit("randomCard", randomCard, login);
        }
      } catch (error) {
        console.error("Database error: " + error);
      }
    });

    socket.on("get_path_by_name_enemy", async (name) => {
      try {
        const path = await gameModel.getAvatarPathByUsername(name);
        if (path) {
          socket.emit("send-path_enemy", path.avatar_path);
        }
      } catch (error) {
        console.error("Database error: " + error);
      }
    });

    socket.on("get_path_by_name_my", async (name) => {
      try {
        const path = await gameModel.getAvatarPathByUsername(name);
        if (path) {
          socket.emit("send-path_my", path.avatar_path);
        }
      } catch (error) {
        console.error("Database error: " + error);
      }
    });

    socket.on("first-step", (roomId) => {
      const room = rooms.find((r) => r.name === roomId);
      const randomIndex = Math.floor(Math.random() * 2);
      io.emit("first-step-result", room.players[randomIndex]);
    });

    socket.on("start-game", () => {
      let mana = 2;
      socket.emit("game-started", mana);
    });

    socket.on("start-turn-timer", (seconds, roomId) => {
      const room = rooms.find((r) => r.name === roomId);
      const timerDuration = seconds * 1000;

      io.emit("timer-duration", timerDuration, roomId);

      setTimeout(() => {
        room.players.forEach((player) => {
          io.emit("turn-timeout", player);
        });
      }, timerDuration);
    });

    socket.on("disconnect", () => {
      console.log("disconnected from socket server");
    });
  });
};
