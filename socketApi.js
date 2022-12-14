const socket_io = require('socket.io');
const io = socket_io();
let socketApi = {};

socketApi.io = io;

io.on('connection', (socket) => {
    socket.on('join-room', async (roomId, username) => {
        /** Initial Connection */
        socket.join(roomId); 
        socket.data.user = {'username': username, 'rating': 0}; // initial user data. rating = 0 by default 

        await updateUserList(io, roomId);

        socket.on('update-rating', async (rating) => {
            socket.data.user = {'username': username, 'rating': rating};
            await updateUserList(io, roomId);
        });

        socket.on('show-rating', () => {
            io.to(roomId).emit('show-rating');
        })

        socket.on('disconnect', async () => {
            io.to(roomId).emit('user-disconnected', socket.id);
            await updateUserList(io, roomId);
        });

        socket.on('refresh-ratings', async () => {
            io.to(roomId).emit('refresh-ratings', socket.id);
            await refreshUserRatings(io, roomId);
            await updateUserList(io, roomId);
        });
    });
});

async function refreshUserRatings(io, roomId) {
    let userList = await io.in(roomId).fetchSockets() 
    userList.forEach(socket => { socket.data.user.rating = 0; });
}

/** Send updated user list to clients the room */
async function updateUserList(io, roomId) {
    let userList = await io.in(roomId).fetchSockets() 
    let userListHashMap = {};
    userList.forEach(socket => {
        userListHashMap[socket.id] = socket.data.user;
    });
    io.to(roomId).emit('user-list', userListHashMap);
}

/*  60/40 have the server handle most of the workload and the client-side handle the rest.
    There will be less back and forth between the server and the client so, its easier to implement.

    Ideally, the client would handle most of the workload. Just send the data to the client 
    and the client will take care of it.  */

module.exports = socketApi;