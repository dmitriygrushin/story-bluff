const socket = io();

const ratingButtons = document.getElementsByClassName('rate-button');
const userListTag = document.getElementById('user-list');

socket.emit('join-room', roomId, username);

socket.on('user-list', (userList) => {
    // loop over userList hashmap and add each user to the userListTag
    for (let userId in userList) {
        let user = userList[userId];
        let listItem = document.createElement('li');
        listItem.style.fontSize = '1.3em';
        if (user.rating == 0) user.rating = '✘';
        listItem.innerHTML = `${user.username}: ${user.rating}`;
        userListTag.appendChild(listItem);
    }
});


// set onclick listener for all rating-buttons class
for (let i = 0; i < ratingButtons.length; i++) {
    ratingButtons[i].addEventListener('click', (e) => {
        socket.emit('update-rating', e.target.value);
    });
}
