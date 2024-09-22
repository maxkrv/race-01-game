const hand = document.querySelector(".hand");
const enemyHead = document.querySelector(".enemy-head");
const myHead = document.querySelector(".my-head");
const enemyField = document.querySelector(".enemy-field");
const tableField = document.querySelector(".my-field");
const manaValue = document.querySelector(".value");
const enemyName = document.querySelector(".enemy-name");
const myName = document.querySelector(".my-name");
const timerDisplay = document.getElementById("timer");
const enemyImg = document.querySelector(".enemy-head");
const myImg = document.querySelector(".my-head");
const Move = document.querySelector(".currentMove");

const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("roomId");
const currentLogin = urlParams.get("playerName");

let countCardsInHand = 0;
let isGameEnded = false;
let isPlayerAllowedToInteract = false;
let currentMana = null;
let maxMana = null;
let currentEnemy = null;
let currentSocketId = null;
let sendDamage = {
  damage: null,
  attackingCardId: null,
  enemyCard: null,
};

const socket = io();

function loadCurrentMana() {
  manaValue.textContent = currentMana;
}

function loadCurrentPlayer(player) {
  Move.textContent = player;
}

function reloadCardsUsed() {
  let myCardElements = document.querySelectorAll(".my-card");

  for (let i = 0; i < myCardElements.length; i++) {
    let myCardElement = myCardElements[i];
    let tempElement = myCardElement.querySelector(".card");

    if (tempElement) {
      tempElement.setAttribute("data-is-used", false);
    }
  }
}

function getCardPrice(card) {
  const statsElementText = card.firstElementChild.textContent;
  const priceIndexStart =
    statsElementText.indexOf("price: ") + "price: ".length;
  const priceIndexEnd = statsElementText.indexOf(",", priceIndexStart);
  const priceValue = statsElementText.slice(priceIndexStart, priceIndexEnd);
  return priceValue;
}

function createEnemyCard(card) {
  const cardElement = document.createElement("div");
  cardElement.className = "card";
  cardElement.draggable = true;
  cardElement.textContent = card.name;
  cardElement.style.backgroundImage = `url("img/${card.image_path}")`;

  const statsElement = document.createElement("div");
  statsElement.className = "card-stats";
  statsElement.textContent = `Cost: ${card.cost}, Attack: ${card.damage}, Health: ${card.hp}`;

  cardElement.setAttribute("data-text", card.description);

  cardElement.appendChild(statsElement);

  cardElement.dataset.id = card.id;

  for (const child of enemyField.children) {
    if (child.childElementCount == 0) {
      child.appendChild(cardElement);
      break;
    }
  }
}

function createCard(card) {
  if (countCardsInHand >= 6) {
    return;
  } else {
    countCardsInHand++;
  }

  const cardElement = document.createElement("div");
  cardElement.className = "card";
  cardElement.draggable = true;
  cardElement.textContent = card.name;
  cardElement.style.backgroundImage = `url("img/${card.image_path}")`;

  const statsElement = document.createElement("div");
  statsElement.className = "card-stats";
  statsElement.textContent = `Cost: ${card.cost}, Attack: ${card.damage}, Health: ${card.hp}`;

  cardElement.setAttribute("data-text", card.description);

  cardElement.appendChild(statsElement);

  cardElement.dataset.id = card.id;
  cardElement.setAttribute("data-is-used", false);

  hand.appendChild(cardElement);

  cardElement.addEventListener("dragstart", handleDragStart);
}

function handleDragStart(event) {
  if (!isPlayerAllowedToInteract) {
    alert("Not your turn yet!");
    return;
  }
  if (currentMana < getCardPrice(event.target)) {
    alert("Not enough coins!");
    return;
  }
  event.dataTransfer.setData("text/plain", event.target.dataset.id);
}

function handleDragOver(event) {
  if (!isPlayerAllowedToInteract) {
    return;
  }
  event.preventDefault();
}

function handleDrop(event) {
  if (!isPlayerAllowedToInteract) {
    return;
  }
  event.preventDefault();
  const cardId = event.dataTransfer.getData("text/plain");
  const cardElement = hand.querySelector(`[data-id="${cardId}"]`);

  if (event.target.classList.contains("my-card")) {
    const clonedCard = cardElement.cloneNode(true);
    clonedCard.setAttribute("data-is-used", true);

    event.target.appendChild(clonedCard);

    clonedCard.addEventListener("mouseover", function () {
      this.style.transform = "translateY(-10px) scale(1.5)";
    });

    clonedCard.addEventListener("mouseout", function () {
      this.style.transform = "scale(1)";
    });

    currentMana -= Number.parseInt(
      getCardPrice(event.target.firstElementChild)
    );

    loadCurrentMana();

    cardElement.remove();
    countCardsInHand--;

    socket.emit("put-card", cardId, currentLogin);
  }
}

function handleCardClick(event) {
  if (!isPlayerAllowedToInteract) {
    alert("Not your turn yet!");
    return;
  }

  const card = event.target;

  if (card.getAttribute("data-is-used") == "true") {
    alert("This card is used already");
    return;
  }

  if (
    card.classList.contains("card") &&
    card.parentElement.classList.contains("my-card")
  ) {
    const myCards = document.querySelectorAll(".my-card .card");
    myCards.forEach((myCard) => {
      myCard.classList.remove("glow");
    });

    card.classList.toggle("glow");
  }

  if (card.parentElement.className == "my-card") {
    if (sendDamage.attackingCardId) {
      let myCardElements = document.querySelectorAll(".my-card");
      let cardElement = null;

      for (let i = 0; i < myCardElements.length; i++) {
        let myCardElement = myCardElements[i];
        let tempElement = myCardElement.querySelector(".card");

        if (tempElement) {
          let searchedCardId = tempElement.getAttribute("data-id");
          if (searchedCardId == sendDamage.attackingCardId) {
            cardElement = tempElement;
            break;
          }
        }
      }

      cardElement.setAttribute("data-is-used", false);
    }

    const statsElementText = card.firstElementChild.textContent;
    const attackIndexStart =
      statsElementText.indexOf("Attack: ") + "Attack: ".length;
    const attackIndexEnd = statsElementText.indexOf(",", attackIndexStart);
    const attackValue = statsElementText.slice(
      attackIndexStart,
      attackIndexEnd
    );
    sendDamage.damage = attackValue;
    sendDamage.attackingCardId = card.dataset.id;
    card.setAttribute("data-is-used", true);
  } else {
    sendDamage.enemyCard = card.dataset.id;
  }

  if (sendDamage.damage != null && sendDamage.enemyCard != null) {
    socket.emit("send-damage", sendDamage, currentLogin, roomId);

    sendDamage.damage = null;
    sendDamage.attackingCardId = null;
    sendDamage.enemyCard = null;
  }
}

function getFirstPlayer(socket, roomId) {
  try {
    socket.emit("first-step", roomId);

    const firstMove = new Promise((resolve, reject) => {
      socket.on("first-step-result", (player) => {
        resolve(player);
      });
    });

    return firstMove;
  } catch (error) {
    throw error;
  }
}

socket.on("timer-duration-ready", (time) => {
  const countdownElement = document.querySelector(".countdown");

  let countdownValue = time;

  function updateCountdown() {
    countdownElement.textContent = countdownValue;
    countdownValue--;

    if (countdownValue < 0) {
      countdownElement.style.display = "none";
      clearInterval(interval);
    }
  }

  const interval = setInterval(updateCountdown, 1000);
});

socket.on("players-ready", () => {
  socket.emit("send-enemy", currentLogin, roomId);

  socket.on("get-enemy", (enemy, sender) => {
    if (sender == currentLogin) {
      currentEnemy = enemy;
      socket.emit("get_path_by_name_enemy", currentEnemy);
    }
  });

  socket.emit("get_path_by_name_my", currentLogin);
  socket.on("send-path_my", (path) => {
    if (path != null) {
      myImg.style.backgroundImage = `url("avatars/${path}")`;
    }
  });

  socket.on("send-path_enemy", (path) => {
    if (path != null) {
      enemyImg.style.backgroundImage = `url("avatars/${path}")`;
    }
  });

  for (let index = 0; index < 3; index++) {
    socket.emit("get-card", currentLogin);
  }

  getFirstPlayer(socket, roomId).then((firstMove) => {
    if (currentLogin == firstMove) {
      isPlayerAllowedToInteract = true;
      loadCurrentPlayer(currentLogin);
    } else {
      loadCurrentPlayer(currentEnemy);
    }
  });

  socket.emit("start-game");

  socket.on("game-started", (mana) => {
    maxMana = mana;
    currentMana = maxMana;
    loadCurrentMana();
    myName.textContent = currentLogin;
    enemyName.textContent = currentEnemy;
    if (isPlayerAllowedToInteract) {
      console.log(`${currentLogin}'s turn now`);

      socket.emit("start-turn-timer", 10, roomId);
    } else {
      console.log("Not your turn!");
    }
  });

  socket.on("turn-timeout", (receiver) => {
    if (receiver != currentLogin) {
      return;
    }
    console.log("Time is over.");
    if (isPlayerAllowedToInteract && !isGameEnded) {
      isPlayerAllowedToInteract = false;
    } else if (!isGameEnded) {
      isPlayerAllowedToInteract = true;
    }

    if (maxMana <= 9) {
      maxMana++;
    }
    currentMana = maxMana;
    loadCurrentMana();
    if (isPlayerAllowedToInteract && !isGameEnded) {
      socket.emit("start-turn-timer", 30, roomId);
      socket.emit("get-card", currentLogin);
      loadCurrentPlayer(currentLogin);
      reloadCardsUsed();
    } else {
      loadCurrentPlayer(currentEnemy);
    }
  });

  socket.on("randomCard", (randomCard, login) => {
    if (login == currentLogin) {
      createCard(randomCard);
    }
  });

  socket.on("load-enemy-card", (enemyCard, sender) => {
    if (currentLogin != sender) {
      createEnemyCard(enemyCard);
    }
  });

  socket.on("get-damage", (damage, damagedCardId, damagedPlayer) => {
    if (damagedPlayer == currentLogin) {
      let myCardElements = document.querySelectorAll(".my-card");
      let cardElement = null;

      for (let i = 0; i < myCardElements.length; i++) {
        let myCardElement = myCardElements[i];

        let tempElement = myCardElement.querySelector(".card");

        if (tempElement) {
          var searchedCardId = tempElement.getAttribute("data-id");

          if (searchedCardId == damagedCardId) {
            cardElement = tempElement;
            break;
          }
        }
      }

      let statsElementText = cardElement.firstElementChild.textContent;
      const healthIndexStart =
        statsElementText.indexOf("Health: ") + "Health: ".length;
      const healthValue = statsElementText.slice(healthIndexStart);

      const remainingHealth = healthValue - damage;

      if (remainingHealth <= 0) {
        cardElement.remove();
      } else {
        statsElementText = statsElementText.replace(
          /Health: \d+/,
          `Health: ${remainingHealth}`
        );
        cardElement.firstElementChild.textContent = statsElementText;
      }

      socket.emit(
        "send-enemy-card-damaged",
        damage,
        damagedCardId,
        damagedPlayer
      );
    }
  });

  socket.on(
    "get-enemy-card-damaged",
    (damage, damagedCardId, damagedPlayer) => {
      if (damagedPlayer != currentLogin) {
        let enemyCardElements = document.querySelectorAll(".enemy-card");
        let cardElement = null;

        for (let i = 0; i < enemyCardElements.length; i++) {
          let enemyCardElement = enemyCardElements[i];

          let tempElement = enemyCardElement.querySelector(".card");

          if (tempElement) {
            var searchedCardId = tempElement.getAttribute("data-id");

            if (searchedCardId == damagedCardId) {
              cardElement = tempElement;
              break;
            }
          }
        }

        let statsElementText = cardElement.firstElementChild.textContent;
        const healthIndexStart =
          statsElementText.indexOf("Health: ") + "Health: ".length;
        const healthValue = statsElementText.slice(healthIndexStart);

        const remainingHealth = healthValue - damage;

        if (remainingHealth <= 0) {
          cardElement.remove();
        } else {
          statsElementText = statsElementText.replace(
            /Health: \d+/,
            `Health: ${remainingHealth}`
          );
          cardElement.firstElementChild.textContent = statsElementText;
        }
      }
    }
  );

  socket.on("get-player-damage", (sender, damage) => {
    if (sender == currentLogin) {
      return;
    }

    const head = myHead.parentElement;
    const myHp = head.children[1].textContent;
    const remainingHp = myHp - damage;
    if (remainingHp <= 0) {
      head.children[1].textContent = `0`;
      socket.emit("send-remainig-hp", `0`, currentLogin);
      socket.emit("end-game", currentLogin);
    } else {
      head.children[1].textContent = remainingHp;
      socket.emit("send-remainig-hp", remainingHp, currentLogin);
    }
  });

  socket.on("get-remainig-hp", (remainingHp, sender) => {
    if (sender == currentLogin) {
      return;
    }

    const head = enemyHead.parentElement;
    head.children[1].textContent = remainingHp;
  });

  tableField.addEventListener("dragover", handleDragOver);
  tableField.addEventListener("drop", handleDrop);

  enemyField.addEventListener("click", handleCardClick);
  tableField.addEventListener("click", handleCardClick);
  enemyHead.addEventListener("click", (event) => {
    if (sendDamage.damage) {
      socket.emit("send-player-damage", currentLogin, sendDamage.damage);
      sendDamage.damage = null;
      sendDamage.attackingCardId = null;
    }
  });

  socket.on("timer-duration", (duration) => {
    let currentTime = duration / 1000;

    timerInterval = setInterval(() => {
      currentTime--;
      timerDisplay.textContent = `${currentTime}`;

      if (currentTime <= 0) {
        clearInterval(timerInterval);
      }
    }, 1000);
  });

  socket.on("game-ended", (player) => {
    isGameEnded = true;
    const gameEndMessage = document.getElementById("game-end-message");
    gameEndMessage.innerHTML = `<p style="font-size: 24px; color: red; font-family: fantasy;">GAME OVER! ${player} lost!</p>`;
  });
});
