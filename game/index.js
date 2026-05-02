import { CellValues, CellStates, Cell } from "./cell.js";
import { Grid } from "./grid.js";
import { GameState } from "./state.js";

const DEBUG = false;

// Declare global states
const X_SIZE = 10;
const Y_SIZE = 10;
const GRID_SIZE = X_SIZE * Y_SIZE;
const BOMB_COUNT = 15;
const NON_BOMB_COUNT = GRID_SIZE - BOMB_COUNT;

var gameState;
var revealedNonBombCount;
var gridConfig = new Grid(X_SIZE, Y_SIZE, BOMB_COUNT);
var grid = [];

resetGame()
showDetails(BOMB_COUNT);

// Use element variables
const msgEl = document.getElementById("message");
const btnReset = document.getElementById("btnReset");
const btnSave = document.getElementById("btnSave");
const btnLoad = document.getElementById("btnLoad");

btnReset.addEventListener("click", resetGame);
btnSave.addEventListener("click", saveGrid);
btnLoad.addEventListener("click", loadGrid);

// Function to render the whole grid
function renderGrid() {
  const gridEl = document.getElementById("grid");
  gridEl.innerHTML = "";
  grid.forEach((row) => {
    var rowEl = document.createElement("tr");
    row.forEach((cell) => {
      var tdEl = document.createElement("td");
      var btnEl = document.createElement("button");

      btnEl.id = `cell_${cell.x}_${cell.y}`
      btnEl.classList.add(CellStates.COVERED)
      btnEl.addEventListener("click", (e) => revealCell(e, cell));
      btnEl.addEventListener("contextmenu", (e) => toggleFlagCell(e, cell));
      tdEl.appendChild(btnEl);
      rowEl.appendChild(tdEl);  
    });
    gridEl.appendChild(rowEl);
  });
  if (grid.gameState == GameState.WON || grid.gameState == GameState.LOSE) {
    showMessage(grid.gameState);
    setTimeout(function () {
      resetGrid();
    }, 5000);
  }
}

// Function to diplay message
function showMessage(text) {
  msgEl.innerHTML = text;
  setTimeout(function () {
    msgEl.innerHTML = "";
  }, 3000);
}

// Function to diplay message
function showDetails(bombCount) {
  var bombCountEl = document.getElementById("bombCount")
  bombCountEl.innerHTML = bombCount
}

// Function to reset the counter
function resetGrid() {
  grid = gridConfig.initGrid();
  renderGrid();
}

function resetGame() {
  resetGrid()
  gameState = GameState.INPROGRESS;
  revealedNonBombCount = 0;
  console.log("RESETTING GAME...")
  debugState()
}

function debugState() {
  if (!DEBUG) {
    return;
  }
  console.log("grid:", grid);
  console.log("bombLocs:", gridConfig.bombLocs);
  console.log("gameState:", gameState);
  console.log("revealedNonBombCount:", revealedNonBombCount);
}

// Function to save the grid
function saveGrid() {
  localStorage.setItem("grid", JSON.stringify({
    xSize: gridConfig.xSize,
    ySize: gridConfig.ySize,
    bombCount: gridConfig.bombCount,
    bombLocs: gridConfig.bombLocs,
  }));
  showMessage("Saved!");
}

// Function to load the grid, not including game state yet
function loadGrid() {
  let saved = localStorage.getItem("grid");
  if (saved !== null) {
    var parsed = JSON.parse(saved);
    var gridConfig = new Grid(parsed.xSize, parsed.ySize, parsed.bombCount, parsed.bombLocs);
    grid = gridConfig.initGridWithBombLocs();
    showMessage("Loaded!");
  }
  renderGrid();
}

function flood(cCell) {
  var x = cCell.x
  var y = cCell.y;
  var state = cCell.state;
  var value = cCell.value;
  // TODO: refactor toggling between states
  if (state == CellStates.FLAGGED) {
    return;
  }

  if (state == CellStates.COVERED) {
    grid[x][y].state = CellStates.REVEALED
    var cellEl = document.getElementById(`cell_${x}_${y}`);
    cellEl.classList.remove(CellStates.COVERED)
    cellEl.classList.add(CellStates.REVEALED)
    cellEl.innerHTML = grid[x][y].getDescription()
  }
  if (value == CellValues.BOMB) {
    gameState = GameState.LOSE;
    return;
  }
  revealedNonBombCount += 1;
  if (value != CellValues[0]) {
    return;
  }
  var neiLocs = gridConfig.getCellNeighborLocs(x, y);
  if (neiLocs.length == 0) {
    return;
  }
  neiLocs.forEach((neiLoc) => {
    var neiX = neiLoc[0];
    var neiY = neiLoc[1];
    var neiCovered = grid[neiX][neiY].state == CellStates.COVERED;
    if (neiCovered) {
      flood(grid[neiX][neiY]);
    }
  });
}

function revealCell(e, cCell) {
  if (gameState != GameState.INPROGRESS) {
    return;
  }
  flood(cCell);
  if (revealedNonBombCount == NON_BOMB_COUNT) {
    gameState = GameState.WON;
  }
  if (gameState == GameState.WON || gameState == GameState.LOSE) {
    showMessage(gameState);
    setTimeout(function () {
      resetGame();
    }, 5000);
  }
  debugState();
}

function toggleFlagCell(e, cCell) {
  // TODO: refactor changing state
  e.preventDefault();
  var x = cCell.x;
  var y = cCell.y;
  var state = cCell.state;
  var cellEl = document.getElementById(`cell_${x}_${y}`);
  switch (state) {
    case CellStates.FLAGGED:
      grid[x][y].state = CellStates.COVERED;
      cellEl.classList.add(CellStates.COVERED);
      cellEl.classList.remove("flagged");
      cellEl.innerHTML = "";
      break;
    case CellStates.COVERED:
      grid[x][y].state = CellStates.FLAGGED;
      cellEl.classList.remove(CellStates.COVERED);
      cellEl.classList.add("flagged");
      cellEl.innerHTML = CellValues.FLAG.description;
    default:
      break;
  }
}
