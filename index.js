const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('¡Alguien entró a Coluz!');
  socket.on('chat message', (data) => {
    io.emit('chat message', data);
  });
});

const PORT = 3000;
http.listen(PORT, () => {
  console.log('⚡ COLUZ ESTÁ VIVO en http://localhost:3000');
});