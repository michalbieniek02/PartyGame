const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  })
  

const PORT = 4000;

const lobbies = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createGame', ({ username }) => {
    const lobbyCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    socket.join(lobbyCode);
    lobbies[lobbyCode] = { host: socket.id, users: [{ id: socket.id, username, points: 0 }] };
    socket.emit('lobbyCreated', { lobbyCode });
  });

  socket.on('joinGame', ({ username, lobbyCode }) => {
    if (lobbies[lobbyCode]) {
      socket.join(lobbyCode);
      lobbies[lobbyCode].users.push({ id: socket.id, username, points: 0 });
      io.to(lobbyCode).emit('userJoined', { users: lobbies[lobbyCode].users });
    } else {
      socket.emit('invalidLobby');
    }
  });

  socket.on('startRound', ({ question, alternativeQuestion }) => {
    const lobbyCode = Object.keys(socket.rooms)[1];
    const users = lobbies[lobbyCode].users;
    const shuffledUsers = users.sort(() => Math.random() - 0.5);
    const alternativeUser = shuffledUsers.pop();

    io.to(lobbyCode).emit('startRound', {
      question,
      answers: users.map(user => ({ username: user.username, answer: user.id === alternativeUser.id ? alternativeQuestion : 'Answer' }))
    });
  });

  socket.on('chooseWinner', ({ winner }) => {
    const lobbyCode = Object.keys(socket.rooms)[1];
    const user = lobbies[lobbyCode].users.find(u => u.username === winner);
    if (user) {
      user.points += 1;
      io.to(lobbyCode).emit('updateWinner', { winner, points: user.points });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
  
