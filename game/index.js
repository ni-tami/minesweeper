import { Grid } from "./grid.js";
import { Cell, CellValues } from "./cell.js";
import { getRandomInt } from "../utils/index.js";

// Declare the counter
var grid = new Grid(10, 10, 15);
grid.initGrid();
updateGrid();

// Use element variables
const msgEl = document.getElementById("message");
const btnReset = document.getElementById("btnReset");
const btnSave = document.getElementById("btnSave");
const btnLoad = document.getElementById("btnLoad");


btnReset.addEventListener("click", resetGrid);
btnSave.addEventListener("click", saveGrid);
btnLoad.addEventListener("click", loadGrid);

// Function to display the counter
function updateGrid() {
  const gridEl = document.getElementById("grid");
  grid.getGrid().forEach((row) => {
    var rowEl = document.createElement("tr");
    row.forEach((cell) => {
      var btnEl = document.createElement("button");
      btnEl.style = "width: 32px; height: 32px; font-size: 16px;";
      btnEl.innerHTML = cell.getDescription() || " ";
      rowEl.appendChild(btnEl);  
    });
    gridEl.appendChild(rowEl);
  });
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
  const gridEl = document.getElementById("grid");
  gridEl.innerHTML = "";
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

// Function to load the grid
function loadGrid() {
  const gridEl = document.getElementById("grid");
  gridEl.innerHTML = "";
  let saved = localStorage.getItem("grid");
  if (saved !== null) {
    var parsed = JSON.parse(saved);
    grid = new Grid(parsed.xSize, parsed.ySize, parsed.bombCount);
    grid.initEmptyGrid();
    grid.bombLocs = parsed.bombLocs;
    grid.initGridWithBombLocs();
    showMessage("Loaded!");
  }
  updateGrid();
}
