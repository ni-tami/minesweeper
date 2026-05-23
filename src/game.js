import { CellStates, CellValues } from "./cell.js";
import { Grid } from "./grid.js";
import { GameState } from "./state.js";

export class Game {
  constructor({ xSize, ySize, bombCount, bombLocs } = {}) {
    this._assertConfig(xSize, ySize, bombCount);

    this.xSize = xSize;
    this.ySize = ySize;
    this.bombCount = bombCount;
    this.nonBombCount = xSize * ySize - bombCount;

    this._initGrid(bombLocs);
    this.gameState = GameState.INPROGRESS;
    this.revealedNonBombCount = 0;
  }

  _assertConfig(xSize, ySize, bombCount) {
    if (typeof xSize !== "number" || typeof ySize !== "number" || typeof bombCount !== "number") {
      throw new Error("Game requires numeric xSize, ySize, and bombCount.");
    }
  }

  _initGrid(bombLocs = []) {
    const hasBombLocs = Array.isArray(bombLocs) && bombLocs.length > 0;
    const bombLocsCopy = hasBombLocs ? bombLocs.map(([x, y]) => [x, y]) : [];

    this.gridConfig = new Grid(this.xSize, this.ySize, this.bombCount, bombLocsCopy);
    this.grid = hasBombLocs
      ? this.gridConfig.initGridWithBombLocs()
      : this.gridConfig.initGrid();
  }

  _assertIndexInBounds(x, y) {
    if (x < 0 || x >= this.xSize || y < 0 || y >= this.ySize) {
      throw new Error("Index out of bounds.");
    }
  }

  _toRenderedCell(cell) {
    return {
      x: cell.x,
      y: cell.y,
      state: cell.state,
      text: this._getCellText(cell),
    };
  }

  _getCellText(cell) {
    if (cell.state === CellStates.COVERED) {
      return "";
    }
    if (cell.state === CellStates.FLAGGED) {
      return CellValues.FLAG.description;
    }
    return cell.getDescription();
  }

  _flood(x, y, initialCells) {
    const cell = this.grid[x][y];
    if (cell.state !== CellStates.COVERED) {
      return;
    }

    cell.state = CellStates.REVEALED;
    initialCells.push(this._toRenderedCell(cell));

    if (cell.value === CellValues.BOMB) {
      return;
    }

    this.revealedNonBombCount += 1;
    if (cell.value !== CellValues[0]) {
      return;
    }

    const neiLocs = this.gridConfig.getCellNeighborLocs(x, y);
    neiLocs.forEach(([neiX, neiY]) => {
      const neiCell = this.grid[neiX][neiY];
      const canRevealNei =
        neiCell.state === CellStates.COVERED && neiCell.value !== CellValues.BOMB;
      if (canRevealNei) {
        this._flood(neiX, neiY, initialCells);
      }
    });
  }

  getCell(x, y) {
    this._assertIndexInBounds(x, y);
    return this.grid[x][y];
  }

  revealCell(x, y) {
    this._assertIndexInBounds(x, y);
    if (this.gameState !== GameState.INPROGRESS) {
      return { initialCells: [], gameState: this.gameState, exploded: false };
    }

    const initialCells = [];
    const cell = this.getCell(x, y);
    if (cell.state !== CellStates.COVERED) {
      return { initialCells, gameState: this.gameState, exploded: false };
    }

    if (cell.value === CellValues.BOMB) {
      cell.state = CellStates.REVEALED;
      initialCells.push(this._toRenderedCell(cell));
      this.gameState = GameState.LOSE;
      return { initialCells, gameState: this.gameState, exploded: true };
    }

    this._flood(x, y, initialCells);
    if (this.revealedNonBombCount === this.nonBombCount) {
      this.gameState = GameState.WON;
    }

    return { initialCells, gameState: this.gameState, exploded: false };
  }

  toggleFlag(x, y) {
    this._assertIndexInBounds(x, y);
    if (this.gameState !== GameState.INPROGRESS) {
      return { initialCells: [], gameState: this.gameState };
    }

    const cell = this.getCell(x, y);
    switch (cell.state) {
      case CellStates.COVERED:
        cell.state = CellStates.FLAGGED;
        break;
      case CellStates.FLAGGED:
        cell.state = CellStates.COVERED;
        break;
      default:
        return { initialCells: [], gameState: this.gameState };
    }

    return { initialCells: [this._toRenderedCell(cell)], gameState: this.gameState };
  }

  reset({ bombLocs, keepBombLayout = false } = {}) {
    let nextBombLocs = [];
    if (keepBombLayout) {
      nextBombLocs = this.gridConfig.bombLocs.map(([x, y]) => [x, y]);
    } else if (Array.isArray(bombLocs) && bombLocs.length > 0) {
      nextBombLocs = bombLocs;
    }

    this._initGrid(nextBombLocs);
    this.gameState = GameState.INPROGRESS;
    this.revealedNonBombCount = 0;

    return { initialCells: this.grid.flat().map((cell) => this._toRenderedCell(cell)), gameState: this.gameState };
  }

  getSnapshot() {
    return {
      xSize: this.xSize,
      ySize: this.ySize,
      bombCount: this.bombCount,
      bombLocs: this.gridConfig.bombLocs.map(([x, y]) => [x, y]),
      gameState: this.gameState,
      revealedNonBombCount: this.revealedNonBombCount,
      cellStates: this.grid.map((row) => row.map((cell) => cell.state)),
    };
  }

  serialize() {
    return JSON.stringify(this.getSnapshot());
  }

  static fromSnapshot(snapshot) {
    const game = new Game({
      xSize: snapshot.xSize,
      ySize: snapshot.ySize,
      bombCount: snapshot.bombCount,
      bombLocs: snapshot.bombLocs,
    });

    if (Array.isArray(snapshot.cellStates)) {
      for (let x = 0; x < game.xSize; x++) {
        for (let y = 0; y < game.ySize; y++) {
          const snapshotState = snapshot.cellStates?.[x]?.[y];
          if (snapshotState) {
            game.grid[x][y].state = snapshotState;
          }
        }
      }
    }

    if (typeof snapshot.revealedNonBombCount === "number") {
      game.revealedNonBombCount = snapshot.revealedNonBombCount;
    } else {
      game.revealedNonBombCount = game.grid.flat().filter((cell) => {
        return cell.state === CellStates.REVEALED && cell.value !== CellValues.BOMB;
      }).length;
    }

    game.gameState = snapshot.gameState ?? GameState.INPROGRESS;
    return game;
  }
}
