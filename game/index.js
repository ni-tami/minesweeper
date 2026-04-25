import { Grid } from "./grid.js";
import { Cell } from "./cell.js";
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
      btnEl.innerHTML = cell.value.description || cell.value.toString() || " ";
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
    grid: grid.getGrid(),
    bombLocs: grid.bombLocs,
  }));
  showMessage("Saved!");
}

// Function to load the grid
function loadGrid() {
  let saved = localStorage.getItem("grid");
  if (saved !== null) {
    grid = new Grid(JSON.parse(saved).xSize, JSON.parse(saved).ySize, JSON.parse(saved).bombCount);
    grid.grid = JSON.parse(saved).grid;
    grid.bombLocs = JSON.parse(saved).bombLocs;
    grid.grid = JSON.parse(saved).grid;
    console.log("grid: ", grid);
    console.log("grid.grid: ", grid.grid);
    console.log("grid.bombLocs: ", grid.bombLocs);
    showMessage("Loaded!");
  }
  grid.initGrid();
  updateGrid();
}
