var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};

socketApi.io = io;

io.on('connection', function(socket){
    console.log('A user connected');

    socket.on('message', function(msg){
        console.log(msg);
        io.emit('message', msg);
    })

});

socketApi.sendNotification = function() {
    io.sockets.emit('message', {msg: 'Hello World!'});
}

module.exports = socketApi;