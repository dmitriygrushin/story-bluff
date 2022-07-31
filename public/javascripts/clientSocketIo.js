const socket = io();

socket.emit('join-room', roomId);

socket.on('message', function(msg) {
    console.log(msg);
});
