import { Grid } from "./grid.js";
import { Cell, CellValues } from "./cell.js";
import { getRandomInt } from "../utils/index.js";
import { GameState } from "./state.js";

// Declare the counter
var grid = new Grid(10, 10, 15);
grid.initGrid();
updateGrid();

// Use element variables
const msgEl = document.getElementById("message");
const btnReset = document.getElementById("btnReset");
const btnSave = document.getElementById("btnSave");
const btnLoad = document.getElementById("btnLoad");
// const gridBtns = document.getElementsByClassName("cell");
 

btnReset.addEventListener("click", resetGrid);
btnSave.addEventListener("click", saveGrid);
btnLoad.addEventListener("click", loadGrid);



// Function to display the counter
function updateGrid() {
  const gridEl = document.getElementById("grid");
  gridEl.innerHTML = "";
  grid.getGrid().forEach((row) => {
    var rowEl = document.createElement("tr");
    row.forEach((cell) => {
      var tdEl = document.createElement("td");
      var btnEl = document.createElement("button");
      btnEl.className = cell.isRevealed ? "revealed" : "covered";
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

// Function to diplay message
function showMessage(text) {
  msgEl.innerHTML = text;
  setTimeout(function () {
    msgEl.innerHTML = "";
  }, 3000);
}

// Function to reset the counter
function resetGrid() {
  grid = new Grid(10, 10, 15);
  grid.initGrid();
  updateGrid();
}

// Function to save the grid
function saveGrid() {
  localStorage.setItem("grid", JSON.stringify({
    xSize: grid.xSize,
    ySize: grid.ySize,
    bombCount: grid.bombCount,
    bombLocs: grid.bombLocs,
  }));
  showMessage("Saved!");
}

// Function to load the grid, not including game state yet
function loadGrid() {
  let saved = localStorage.getItem("grid");
  if (saved !== null) {
    var parsed = JSON.parse(saved);
    grid = new Grid(parsed.xSize, parsed.ySize, parsed.bombCount, parsed.bombLocs);
    grid.initGridWithBombLocs();
    showMessage("Loaded!");
  }
  updateGrid();
}

function revealCell(e, cCell) {
  grid.flood(cCell.x, cCell.y);
  updateGrid();
}
