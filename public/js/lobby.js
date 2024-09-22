const socket = io();
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('roomId');
let isReady = false;

// DOM Elements
const roomNameElement = document.getElementById('room-name');
const roomHostElement = document.getElementById('room-host');
const playerListContainer = document.getElementById('player-list-container');
const startButton = document.getElementById('start-button');

// Emitters
socket.emit('get-room', roomId);
socket.emit('get-players', roomId);

// Event Listeners
startButton.addEventListener('click', handlePlayerReady);

// Socket Events
socket.on('get-room-response', updateRoomInfo);
socket.on('send-players', displayPlayers);
socket.on('ready', updateReadyPlayer);
socket.on('start-game', startGame);

// Functions
function updateRoomInfo(room) {
  roomNameElement.textContent = room.name;
  roomHostElement.textContent = room.creator;
}

function displayPlayers(players) {
  playerListContainer.innerHTML = '';
  players.forEach(addPlayerToList);
}

function addPlayerToList(player) {
  const playerElement = document.createElement('div');
  playerElement.textContent = player;
  playerListContainer.appendChild(playerElement);
}

function handlePlayerReady() {
  if (!isReady) {
    socket.emit('player-ready', roomId);
    isReady = true;
  }
}

function updateReadyPlayer(playerName) {
  const playerElement = document.createElement('div');
  playerElement.textContent = `${playerName} (ready)`;
  playerListContainer.appendChild(playerElement);
}

function startGame(roomName, playerName) {
  window.location.href = `/table.html?roomId=${roomName}&playerName=${playerName}`;
}
