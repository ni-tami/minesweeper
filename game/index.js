import { CellValues, CellStates } from "./cell.js";
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

      btnEl.id = `cell_${cell.x}_${cell.y}_${cell.state}`
      btnEl.className = "covered"
      btnEl.addEventListener("click", (e) => revealCell(e, cell));
      tdEl.appendChild(btnEl);
      btnEl.innerHTML = cell.getDescription();
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


function flood(x, y) {
  var cellEl = document.getElementById(
    `cell_${x}_${y}_${CellStates.COVERED}`,
  );

  if (cellEl) {
    cellEl.id = `cell_${x}_${y}_${CellStates.REVEALED}`;
  } else {
    cellEl = document.getElementById(
      `cell_${x}_${y}_${CellStates.REVEALED}`,
    );
  }
  cellEl.className = "revealed"
  if (cellEl.innerHTML == CellValues.BOMB.description) {
      gameState = GameState.LOSE;
      return;
  }
  revealedNonBombCount += 1;
  if (cellEl.innerHTML != CellValues[0].description) {
      return;
  }
  var neiLocs = gridConfig.getCellNeighborLocs(x, y);
  if (neiLocs.length == 0) {
      return
  }
  neiLocs.forEach((neiLoc) => {
      var neiX = neiLoc[0];
      var neiY = neiLoc[1];
      var neiCovered = document.getElementById(
        `cell_${neiX}_${neiY}_${CellStates.COVERED}`,
      );
      if (neiCovered) {
          flood(neiX, neiY);
      }
  })
}


function flood(x, y) {
  var cellEl = document.getElementById(
    `cell_${x}_${y}_${CellStates.COVERED}`,
  );

  if (cellEl) {
    cellEl.id = `cell_${x}_${y}_${CellStates.REVEALED}`;
  } else {
    cellEl = document.getElementById(
      `cell_${x}_${y}_${CellStates.REVEALED}`,
    );
  }
  cellEl.className = "revealed"
  if (cellEl.innerHTML == CellValues.BOMB.description) {
      gameState = GameState.LOSE;
      return;
  }
  revealedNonBombCount += 1;
  if (cellEl.innerHTML != CellValues[0].description) {
      return;
  }
  var neiLocs = gridConfig.getCellNeighborLocs(x, y);
  if (neiLocs.length == 0) {
      return
  }
  neiLocs.forEach((neiLoc) => {
      var neiX = neiLoc[0];
      var neiY = neiLoc[1];
      var neiCovered = document.getElementById(
        `cell_${neiX}_${neiY}_${CellStates.COVERED}`,
      );
      if (neiCovered) {
          flood(neiX, neiY);
      }
  })
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

function revealCell(e, cCell) {
  if (gameState != GameState.INPROGRESS) {
    return;
  }
  flood(cCell.x, cCell.y);
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

function revealCell(e, cCell) {
  if (gameState != GameState.INPROGRESS) {
    return;
  }
  flood(cCell.x, cCell.y);
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

function revealCell(e, cCell) {
  grid.flood(cCell.x, cCell.y);
  if (grid.revealedCount == grid.xSize * grid.ySize - grid.bombCount) {
    grid.gameState = GameState.WON;
    return;
  }
  updateGrid();
}
