const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const stayBtn = document.getElementById("stayBtn");
const switchBtn = document.getElementById("switchBtn");
const resetBtn = document.getElementById("resetBtn");
const doorCountInput = document.getElementById("doorCount");

const gamesEl = document.getElementById("games");
const stayWinsEl = document.getElementById("stayWins");
const switchWinsEl = document.getElementById("switchWins");

const stats = {
  games: 0,
  stayWins: 0,
  switchWins: 0,
};

let state = {};

function getDoorCount() {
  const value = Number.parseInt(doorCountInput.value, 10);
  if (Number.isNaN(value)) {
    return 3;
  }
  return Math.min(30, Math.max(3, value));
}

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

  for (let i = 0; i < state.doorCount; i += 1) {
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
  const doorCount = getDoorCount();
  const carDoor = randomInt(doorCount);
  const prizes = Array(doorCount).fill("goat");
  prizes[carDoor] = "car";

  const columns = Math.min(6, Math.ceil(Math.sqrt(doorCount)));
  boardEl.style.setProperty("--door-columns", String(columns));

  state = {
    doorCount,
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
  const options = Array.from({ length: state.doorCount }, (_, idx) => idx).filter(
    (idx) => idx !== state.selectedDoor && state.prizes[idx] === "goat",
  );

  const doorToKeepClosed = options[randomInt(options.length)];
  const doorsToOpen = options.filter((idx) => idx !== doorToKeepClosed);

  state.openedDoors = doorsToOpen;
  state.hostOpenedDoor = doorsToOpen[0] ?? null;
  state.remainingClosedDoor = doorToKeepClosed;
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
    "Le maître du jeu ouvre toutes les portes chèvres sauf une. Garde ta porte ou change ?";
  renderBoard();
}

function finishGame(strategy) {
  if (state.phase !== "decision") {
    return;
  }

  let finalDoor = state.selectedDoor;

  if (strategy === "switch") {
    finalDoor = state.remainingClosedDoor;
  }

  const win = state.prizes[finalDoor] === "car";

  state.selectedDoor = finalDoor;
  state.phase = "finished";

  state.openedDoors = Array.from({ length: state.doorCount }, (_, idx) => idx);
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
doorCountInput.addEventListener("change", startGame);

startGame();
updateStats();
