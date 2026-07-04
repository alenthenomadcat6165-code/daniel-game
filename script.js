const catButton = document.querySelector("#catButton");
const catScoreEl = document.querySelector("#catScore");
const catRankEl = document.querySelector("#catRank");
const catBoost = document.querySelector("#catBoost");
const resetAll = document.querySelector("#resetAll");
const backToMenu = document.querySelector("#backToMenu");
const gameCards = [...document.querySelectorAll(".game-card")];
const walletPointsEl = document.querySelector("#walletPoints");

const raceTrack = document.querySelector("#raceTrack");
const playerCar = document.querySelector("#playerCar");
const trafficCar = document.querySelector("#trafficCar");
const raceStart = document.querySelector("#raceStart");
const raceScoreEl = document.querySelector("#raceScore");
const raceStatus = document.querySelector("#raceStatus");
const raceMessage = document.querySelector("#raceMessage");

const mergeBoard = document.querySelector("#mergeBoard");
const mergeScoreEl = document.querySelector("#mergeScore");
const mergeStatus = document.querySelector("#mergeStatus");
const mergeNew = document.querySelector("#mergeNew");

const STORAGE_KEYS = {
  points: "pixelPartyPoints",
  retroOwned: "pixelPartyRetroOwned",
  retroOn: "pixelPartyRetroOn",
};

function readNumber(key, fallback = 0) {
  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) ? value : fallback;
}

function updateWallet() {
  walletPointsEl.textContent = readNumber(STORAGE_KEYS.points);
}

function addWalletPoints(amount) {
  if (amount <= 0) return;
  const next = readNumber(STORAGE_KEYS.points) + amount;
  localStorage.setItem(STORAGE_KEYS.points, String(next));
  updateWallet();
}

function applySavedTheme() {
  const ownsRetro = localStorage.getItem(STORAGE_KEYS.retroOwned) === "true";
  const retroOn = localStorage.getItem(STORAGE_KEYS.retroOn) === "true";
  document.body.classList.toggle("retro-theme", ownsRetro && retroOn);
}

let catScore = 0;
let catPower = 1;
let catPointSteps = 0;

function updateCat() {
  catScoreEl.textContent = catScore;
  if (catScore >= 100) catRankEl.textContent = "party legend";
  else if (catScore >= 50) catRankEl.textContent = "zoom mode";
  else if (catScore >= 20) catRankEl.textContent = "happy paws";
  else catRankEl.textContent = "sleepy starter";
}

catButton.addEventListener("click", () => {
  catScore += catPower;
  const nextSteps = Math.floor(catScore / 5);
  addWalletPoints(nextSteps - catPointSteps);
  catPointSteps = nextSteps;
  catButton.classList.remove("cat-pop");
  window.requestAnimationFrame(() => catButton.classList.add("cat-pop"));
  updateCat();
});

catBoost.addEventListener("click", () => {
  if (catScore < 15 || catPower > 1) return;
  catScore -= 15;
  catPower = 2;
  catBoost.textContent = "Treat on";
  updateCat();
});

let lanes = [];
let playerLane = 1;
let trafficLane = 0;
let trafficY = -86;
let raceScore = 0;
let raceSpeed = 3;
let racing = false;
let raceFrame = 0;

function placeCars() {
  updateRaceLanes();
  playerCar.style.left = `${lanes[playerLane]}px`;
  trafficCar.style.left = `${lanes[trafficLane]}px`;
  trafficCar.style.top = `${trafficY}px`;
}

function updateRaceLanes() {
  const trackWidth = raceTrack.clientWidth || 238;
  const carWidth = playerCar.offsetWidth || 44;
  const roadLeft = trackWidth * 0.18;
  const roadWidth = trackWidth * 0.64;
  lanes = [
    Math.max(10, roadLeft + roadWidth * 0.2 - carWidth / 2),
    Math.max(10, roadLeft + roadWidth * 0.5 - carWidth / 2),
    Math.max(10, roadLeft + roadWidth * 0.8 - carWidth / 2),
  ];
}

function resetRace() {
  racing = false;
  updateRaceLanes();
  playerLane = 1;
  trafficLane = Math.floor(Math.random() * lanes.length);
  trafficY = -86;
  raceScore = 0;
  raceSpeed = 3;
  raceScoreEl.textContent = "0";
  raceStatus.textContent = "ready";
  raceMessage.hidden = false;
  raceMessage.textContent = "click track, steer with arrows";
  raceStart.textContent = "Start";
  placeCars();
}

function isCollision() {
  const playerTop = raceTrack.clientHeight - 84;
  const playerBottom = raceTrack.clientHeight - 18;
  const trafficBottom = trafficY + 66;
  return trafficLane === playerLane && trafficBottom > playerTop && trafficY < playerBottom;
}

function raceLoop() {
  if (!racing) return;
  trafficY += raceSpeed;

  if (trafficY > raceTrack.clientHeight + 20) {
    trafficY = -86;
    trafficLane = Math.floor(Math.random() * lanes.length);
    raceScore += 10;
    addWalletPoints(1);
    raceSpeed = Math.min(7.5, raceSpeed + 0.18);
    raceScoreEl.textContent = raceScore;
  }

  if (isCollision()) {
    racing = false;
    raceStatus.textContent = "crashed";
    raceStart.textContent = "Retry";
    raceMessage.hidden = false;
    raceMessage.textContent = "tap retry";
    return;
  }

  placeCars();
  raceFrame = window.requestAnimationFrame(raceLoop);
}

raceStart.addEventListener("click", () => {
  window.cancelAnimationFrame(raceFrame);
  racing = true;
  trafficY = -86;
  trafficLane = Math.floor(Math.random() * lanes.length);
  raceStatus.textContent = "moving";
  raceMessage.hidden = true;
  raceStart.textContent = "Restart";
  raceTrack.focus();
  placeCars();
  raceLoop();
});

raceTrack.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  if (event.key === "ArrowLeft") playerLane = Math.max(0, playerLane - 1);
  if (event.key === "ArrowRight") playerLane = Math.min(lanes.length - 1, playerLane + 1);
  placeCars();
});

let board = [];
let mergeScore = 0;

function emptyCells() {
  const cells = [];
  board.forEach((value, index) => {
    if (!value) cells.push(index);
  });
  return cells;
}

function addTile() {
  const cells = emptyCells();
  if (!cells.length) return;
  const spot = cells[Math.floor(Math.random() * cells.length)];
  board[spot] = Math.random() > 0.88 ? 4 : 2;
  return spot;
}

function tilePositions() {
  return board
    .map((value, index) => ({
      value,
      index,
      row: Math.floor(index / 4),
      col: index % 4,
    }))
    .filter((tile) => tile.value);
}

function renderBoard(previousPositions = [], newIndex = -1, sourceMap = {}) {
  const oldMatches = previousPositions.map((tile) => ({ ...tile, used: false }));
  mergeBoard.innerHTML = "";
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const cell = document.createElement("div");
      cell.className = "merge-cell";
      cell.style.setProperty("--row", row);
      cell.style.setProperty("--col", col);
      mergeBoard.append(cell);
    }
  }

  tilePositions().forEach((tileData) => {
    const sourceIndex = sourceMap[tileData.index];
    let old = null;
    if (tileData.index !== newIndex) {
      old = oldMatches.find((match) => match.index === sourceIndex);
      if (!old) old = oldMatches.find((match) => !match.used && match.value === tileData.value);
    }
    if (old) old.used = true;

    const tile = document.createElement("div");
    tile.className = "tile";
    tile.textContent = tileData.value;
    tile.classList.add(`tile-${tileData.value}`);
    tile.style.setProperty("--row", old ? old.row : tileData.row);
    tile.style.setProperty("--col", old ? old.col : tileData.col);

    if (!old || tileData.index === newIndex) {
      tile.classList.add("tile-new");
    }

    mergeBoard.append(tile);

    window.requestAnimationFrame(() => {
      tile.style.setProperty("--row", tileData.row);
      tile.style.setProperty("--col", tileData.col);
    });
  });
  mergeScoreEl.textContent = mergeScore;
}

function compressLine(line) {
  const clean = line.filter((item) => item.value);
  const merged = [];
  let gained = 0;

  for (let i = 0; i < clean.length; i += 1) {
    if (clean[i + 1] && clean[i].value === clean[i + 1].value) {
      const value = clean[i].value * 2;
      merged.push({ value, from: clean[i].index });
      gained += value;
      i += 1;
    } else {
      merged.push(clean[i]);
    }
  }

  while (merged.length < 4) merged.push({ value: 0, from: -1 });
  return { line: merged, gained };
}

function moveBoard(direction) {
  const old = board.join(",");
  const previousPositions = tilePositions();
  let gained = 0;
  const next = Array(16).fill(0);
  const sourceMap = {};

  for (let i = 0; i < 4; i += 1) {
    let line;
    if (direction === "left") line = [0, 1, 2, 3].map((x) => ({ value: board[i * 4 + x], index: i * 4 + x }));
    if (direction === "right") line = [3, 2, 1, 0].map((x) => ({ value: board[i * 4 + x], index: i * 4 + x }));
    if (direction === "up") line = [0, 1, 2, 3].map((y) => ({ value: board[y * 4 + i], index: y * 4 + i }));
    if (direction === "down") line = [3, 2, 1, 0].map((y) => ({ value: board[y * 4 + i], index: y * 4 + i }));

    const result = compressLine(line);
    gained += result.gained;

    result.line.forEach((tile, index) => {
      let targetIndex;
      if (direction === "left") targetIndex = i * 4 + index;
      if (direction === "right") targetIndex = i * 4 + (3 - index);
      if (direction === "up") targetIndex = index * 4 + i;
      if (direction === "down") targetIndex = (3 - index) * 4 + i;
      next[targetIndex] = tile.value;
      sourceMap[targetIndex] = tile.from;
    });
  }

  board = next;
  if (board.join(",") === old) return;
  mergeScore += gained;
  addWalletPoints(Math.max(1, Math.floor(gained / 8)));
  const newIndex = addTile();
  renderBoard(previousPositions, newIndex, sourceMap);
  updateMergeStatus();
}

function canMove() {
  if (emptyCells().length) return true;
  for (let i = 0; i < 16; i += 1) {
    const right = i % 4 !== 3 && board[i] === board[i + 1];
    const down = i < 12 && board[i] === board[i + 4];
    if (right || down) return true;
  }
  return false;
}

function updateMergeStatus() {
  const max = Math.max(...board);
  if (max >= 2048) mergeStatus.textContent = "2048 found";
  else if (!canMove()) mergeStatus.textContent = "board full";
  else mergeStatus.textContent = `${max || 2} is leading`;
}

function newMergeGame() {
  board = Array(16).fill(0);
  mergeScore = 0;
  addTile();
  addTile();
  renderBoard();
  updateMergeStatus();
}

mergeBoard.addEventListener("keydown", (event) => {
  const map = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "up",
    ArrowDown: "down",
  };
  if (!map[event.key]) return;
  event.preventDefault();
  moveBoard(map[event.key]);
});

mergeNew.addEventListener("click", () => {
  newMergeGame();
  mergeBoard.focus();
});

resetAll.addEventListener("click", () => {
  catScore = 0;
  catPower = 1;
  catPointSteps = 0;
  catBoost.textContent = "Treat x2";
  updateCat();
  resetRace();
  newMergeGame();
});

function enterGame(gameName) {
  document.body.classList.add("playing");
  backToMenu.hidden = false;
  gameCards.forEach((card) => {
    const isActive = card.dataset.game === gameName;
    card.classList.toggle("active-game", isActive);
    card.setAttribute("aria-hidden", isActive ? "false" : "true");
    card.setAttribute("tabindex", isActive ? "-1" : "0");
  });

  if (gameName === "racer") {
    updateRaceLanes();
    placeCars();
    raceTrack.focus();
  }

  if (gameName === "merge") {
    mergeBoard.focus();
  }
}

function leaveGame() {
  document.body.classList.remove("playing");
  backToMenu.hidden = true;
  gameCards.forEach((card) => {
    card.classList.remove("active-game");
    card.setAttribute("aria-hidden", "false");
    card.setAttribute("tabindex", "0");
  });
}

gameCards.forEach((card) => {
  card.addEventListener("click", (event) => {
    if (document.body.classList.contains("playing")) return;
    event.preventDefault();
    event.stopPropagation();
    enterGame(card.dataset.game);
  }, true);

  card.addEventListener("keydown", (event) => {
    if (document.body.classList.contains("playing")) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    enterGame(card.dataset.game);
  });
});

backToMenu.addEventListener("click", leaveGame);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("playing")) {
    leaveGame();
  }
});

window.addEventListener("resize", () => {
  updateRaceLanes();
  placeCars();
});

applySavedTheme();
updateWallet();
updateCat();
resetRace();
newMergeGame();
