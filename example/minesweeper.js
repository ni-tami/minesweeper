import { CellValues, CellStates } from "../src/cell.js";
import { Game } from "../src/game.js";
import { GameState } from "../src/state.js";

const DEBUG = false;

const X_SIZE = 10;
const Y_SIZE = 10;
const BOMB_COUNT = 15;
let game = new Game({ xSize: X_SIZE, ySize: Y_SIZE, bombCount: BOMB_COUNT });

const msgEl = document.getElementById("message");
const btnReset = document.getElementById("btnReset");
const btnSave = document.getElementById("btnSave");
const btnLoad = document.getElementById("btnLoad");

btnReset.addEventListener("click", resetGame);
btnSave.addEventListener("click", saveGrid);
btnLoad.addEventListener("click", loadGrid);

function renderGrid() {
  const gridEl = document.getElementById("grid");
  gridEl.innerHTML = "";
  game.grid.forEach((row) => {
    const rowEl = document.createElement("tr");
    row.forEach((cell) => {
      const tdEl = document.createElement("td");
      const btnEl = document.createElement("button");

      btnEl.id = `cell_${cell.x}_${cell.y}`;
      btnEl.addEventListener("click", () => revealCell(cell.x, cell.y));
      btnEl.addEventListener("contextmenu", (e) => toggleFlagCell(e, cell.x, cell.y));
      updateCellElement(btnEl, cell.state, getCellText(cell.state, cell.getDescription()));
      tdEl.appendChild(btnEl);
      rowEl.appendChild(tdEl);
    });
    gridEl.appendChild(rowEl);
  });
}

function showMessage(text) {
  msgEl.innerHTML = text;
  setTimeout(function () {
    msgEl.innerHTML = "";
  }, 3000);
}

function showDetails(bombCount) {
  const bombCountEl = document.getElementById("bombCount");
  bombCountEl.innerHTML = bombCount;
}

function getCellText(state, revealedText) {
  if (state === CellStates.FLAGGED) {
    return CellValues.FLAG.description;
  }
  if (state === CellStates.REVEALED) {
    return revealedText;
  }
  return "";
}

function updateCellElement(cellEl, state, text) {
  cellEl.classList.remove(CellStates.COVERED, CellStates.REVEALED, CellStates.FLAGGED);
  cellEl.classList.add(state);
  cellEl.innerHTML = text;
}

function updateGameState(cells) {
  cells.forEach((cell) => {
    const cellEl = document.getElementById(`cell_${cell.x}_${cell.y}`);
    if (cellEl) {
      updateCellElement(cellEl, cell.state, cell.text);
    }
  });
}

function handleGameOver(state) {
  if (state !== GameState.WON && state !== GameState.LOSE) {
    return;
  }
  showMessage(state);
  setTimeout(function () {
    resetGame();
  }, 5000);
}

function resetGame() {
  game.reset();
  renderGrid();
  debugState();
}

function saveGrid() {
  localStorage.setItem("grid", game.serialize());
  showMessage("Saved!");
}

function loadGrid() {
  const saved = localStorage.getItem("grid");
  if (saved === null) {
    showMessage("No saved grid found. Resetting...");
    resetGame();
    return;
  }
  try {
    const parsed = JSON.parse(saved);
    game = Game.fromSnapshot(parsed);
    renderGrid();
    showMessage("Loaded!");
    debugState();
  } catch (error) {
    console.error("Failed to load saved game:", error);
    showMessage("Load failed. Resetting...");
    resetGame();
  }
}

function revealCell(x, y) {
  const result = game.revealCell(x, y);
  if (result.initialCells.length === 0) {
    return;
  }
  updateGameState(result.initialCells);
  handleGameOver(result.gameState);
  debugState();
}

function toggleFlagCell(e, x, y) {
  e.preventDefault();
  const result = game.toggleFlag(x, y);
  if (result.initialCells.length > 0) {
    updateGameState(result.initialCells);
    debugState();
  }
}

function debugState() {
  if (!DEBUG) {
    return;
  }
  console.log("snapshot:", game.getSnapshot());
}

showDetails(BOMB_COUNT);
renderGrid();
