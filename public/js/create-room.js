// DOM Elements
const gamePanel = document.getElementById('game-panel');
const playButton = document.getElementById('play-button');
const overlay = document.getElementById('overlay');
const roomListContainer = document.getElementById('room-list-container');

// Socket initialization
const socket = io();

// Event Listeners
playButton.addEventListener('click', toggleGamePanel);
overlay.addEventListener('click', toggleGamePanel);

document.getElementById('create-room-button').addEventListener('click', createRoom);
document.getElementById('find-room-button').addEventListener('click', () => {
    socket.emit('find-room');
});

// Socket Events
socket.on('send-rooms', displayRooms);
socket.on('room-created', (room) => {
    window.location.href = `/lobby.html?roomId=${room.name}`;
});

// Functions
function toggleGamePanel() {
    const isPanelVisible = gamePanel.style.display === 'block';
    gamePanel.style.display = isPanelVisible ? 'none' : 'block';
    overlay.style.display = isPanelVisible ? 'none' : 'block';
}

function createRoom() {
    const roomName = prompt('Room name:');
    if (roomName) {
        socket.emit('create-room', roomName);
    }
}

function displayRooms(rooms) {
    roomListContainer.innerHTML = '';
    const ul = document.createElement('ul');
    
    rooms.forEach((room) => {
        const li = document.createElement('li');
        li.textContent = `Room: ${room.name}, Created by: ${room.creator}`;
        li.addEventListener('click', () => {
            socket.emit('join-room', room.name);
        });
        ul.appendChild(li);
    });

    roomListContainer.appendChild(ul);
}
