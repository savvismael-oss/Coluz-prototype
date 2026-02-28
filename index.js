const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const DATA_FILE = './messages.json';

// --- BASE DE DATOS CASERA ---
// Esto hace que los mensajes NO se borren si el servidor se reinicia
let messages = [];
if (fs.existsSync(DATA_FILE)) {
    try {
        messages = JSON.parse(fs.readFileSync(DATA_FILE));
    } catch (e) {
        messages = [];
    }
}

app.use(express.static('public'));

// Ruta principal para cargar tu index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- LÓGICA DEL CHAT ---
io.on('connection', (socket) => {
    console.log('Usuario conectado al imperio');

    // Enviar todos los mensajes viejos al que acaba de entrar
    socket.emit('load messages', messages);

    // Cuando alguien manda un mensaje
    socket.on('chat message', (msg) => {
        // Le asignamos un ID único para poder borrarlo luego
        msg.id = Date.now() + Math.random();
        
        messages.push(msg);
        
        // Guardar en el archivo para que sea "para siempre"
        fs.writeFileSync(DATA_FILE, JSON.stringify(messages));
        
        // Lo mandamos a todo el mundo
        io.emit('chat message', msg);
    });

    // Acción de borrar mensaje (Solo permitida por el cliente si es OWNER o Autor)
    socket.on('delete message', (data) => {
        messages = messages.filter(m => m.id !== data.id);
        fs.writeFileSync(DATA_FILE, JSON.stringify(messages));
        io.emit('message deleted', data.id);
    });

    socket.on('disconnect', () => {
        console.log('Alguien se fue del chat');
    });
});

// Encender el servidor
http.listen(PORT, () => {
    console.log(`⚡ COLUZ V2 CORRIENDO EN PUERTO ${PORT}`);
});
