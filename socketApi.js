var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};

socketApi.io = io;

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('join-room', async (roomId) => {

        console.log('a client is connected')
        socket.join(roomId); 

        // on message from client send to all clients in the room
        socket.on('message', function(msg){
            console.log(msg);
            io.to(roomId).emit('message', msg);
        })


    });

});

module.exports = socketApi;