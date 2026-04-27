const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const stayBtn = document.getElementById("stayBtn");
const switchBtn = document.getElementById("switchBtn");
const resetBtn = document.getElementById("resetBtn");

const gamesEl = document.getElementById("games");
const stayWinsEl = document.getElementById("stayWins");
const switchWinsEl = document.getElementById("switchWins");

const stats = {
  games: 0,
  stayWins: 0,
  switchWins: 0,
};

let state = {};

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function updateStats() {
  gamesEl.textContent = stats.games;
  stayWinsEl.textContent = stats.stayWins;
  switchWinsEl.textContent = stats.switchWins;
}

function renderBoard(revealAll = false) {
  boardEl.innerHTML = "";

  for (let i = 0; i < 3; i += 1) {
    const button = document.createElement("button");
    button.className = "door";
    button.textContent = `Porte ${i + 1}`;

    if (state.selectedDoor === i) {
      button.classList.add("selected");
    }

    const isOpened = state.openedDoors.includes(i) || (revealAll && state.phase === "finished");

    if (isOpened) {
      const prize = state.prizes[i];
      button.classList.add("open", prize);
      button.textContent = prize === "car" ? "🚗 Voiture" : "🐐 Chèvre";
      button.disabled = true;
    } else if (state.phase !== "pick") {
      button.disabled = true;
    }

    button.addEventListener("click", () => pickDoor(i));
    boardEl.appendChild(button);
  }
}

function startGame() {
  const carDoor = randomInt(3);
  const prizes = ["goat", "goat", "goat"];
  prizes[carDoor] = "car";

  state = {
    prizes,
    phase: "pick",
    selectedDoor: null,
    openedDoors: [],
    hostOpenedDoor: null,
  };

  stayBtn.disabled = true;
  switchBtn.disabled = true;
  statusEl.textContent = "Sélectionne une porte pour commencer.";
  renderBoard();
}

function hostOpensDoor() {
  const options = [0, 1, 2].filter(
    (idx) => idx !== state.selectedDoor && state.prizes[idx] === "goat",
  );
  const opened = options[randomInt(options.length)];
  state.openedDoors.push(opened);
  state.hostOpenedDoor = opened;
}

function pickDoor(doorIndex) {
  if (state.phase !== "pick") {
    return;
  }

  state.selectedDoor = doorIndex;
  hostOpensDoor();
  state.phase = "decision";

  stayBtn.disabled = false;
  switchBtn.disabled = false;
  statusEl.textContent =
    "Le maître du jeu ouvre une porte avec une chèvre. Garde ta porte ou change ?";
  renderBoard();
}

function finishGame(strategy) {
  if (state.phase !== "decision") {
    return;
  }

  let finalDoor = state.selectedDoor;

  if (strategy === "switch") {
    finalDoor = [0, 1, 2].find(
      (idx) => idx !== state.selectedDoor && idx !== state.hostOpenedDoor,
    );
  }

  const win = state.prizes[finalDoor] === "car";

  state.selectedDoor = finalDoor;
  state.phase = "finished";

  state.openedDoors = [0, 1, 2];
  renderBoard(true);

  stats.games += 1;
  if (win && strategy === "stay") {
    stats.stayWins += 1;
  }
  if (win && strategy === "switch") {
    stats.switchWins += 1;
  }
  updateStats();

  stayBtn.disabled = true;
  switchBtn.disabled = true;

  const strategyLabel = strategy === "switch" ? "changer" : "garder";
  statusEl.textContent = win
    ? `Tu as gagné la voiture en choisissant de ${strategyLabel} !`
    : `Perdu, c'était une chèvre. Tu as choisi de ${strategyLabel}.`;
}

stayBtn.addEventListener("click", () => finishGame("stay"));
switchBtn.addEventListener("click", () => finishGame("switch"));
resetBtn.addEventListener("click", startGame);

startGame();
updateStats();
