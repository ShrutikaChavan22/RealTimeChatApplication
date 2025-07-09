const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinRoom', ({ username, room }) => {
    socket.join(room);
    socket.to(room).emit('message', { user: 'system', text: `${username} has joined the room.` });

    socket.on('sendMessage', (message) => {
      io.to(room).emit('message', { user: username, text: message });
    });

    socket.on('typing', () => {
      socket.to(room).emit('typing', { user: username });
    });

    socket.on('stopTyping', () => {
      socket.to(room).emit('stopTyping', { user: username });
    });

    socket.on('disconnect', () => {
      io.to(room).emit('message', { user: 'system', text: `${username} has left the room.` });
    });
  });
});

server.listen(5000, () => {
  console.log('Server running on port 5000');
});
