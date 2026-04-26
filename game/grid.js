import { Cell, CellValues } from "./cell.js";
import { getRandomInt } from "../utils/index.js";
import { GameState } from "./state.js";

export class Grid {
    constructor(xSize, ySize, bombCount, bombLocs = [], revealedCount = 0) {
        if (xSize < 1 | ySize < 1) {
            throw new Error("Invalid grid dimension.");
        }
        if (bombCount >= xSize * ySize) {
            throw new Error("Bomb count must be less than grid size.");
        }
        this.xSize = xSize
        this.ySize = ySize
        this.bombCount = bombCount
        this.initEmptyGrid()
        this.bombLocs = bombLocs
        this.revealedCount = revealedCount
        this.gameState = GameState.INPROGRESS
    }

    getCellNeighborLocs(x, y) {
        if (x < 0 || x >= this.xSize || y < 0 || y >= this.ySize) {
            throw console.error("Index error.");
        }
        const locs = [
            [-1, -1], [0, -1], [1, -1], 
            [-1,  0],          [1,  0], 
            [-1,  1], [0,  1], [1,  1], 
        ]
        var dilated = locs.reduce((_locs, _loc) => {
            var _x = _loc[0] + x
            var _y = _loc[1] + y
            if (_x < this.xSize && _y < this.ySize && _x >= 0 && _y >= 0) {
                _locs.push([_x, _y])
            }
            return _locs
        }, [])

        return dilated
    }

    initEmptyGrid() {
        this.grid = []
        for (let x = 0; x < this.xSize; x++) {
            var row = []
            for (let y = 0; y < this.ySize; y++) {
                row.push(new Cell(x, y, 0, false))
            }
            this.grid.push(row);            
        }
    }

    initGrid() {
        var gridFlatSize = this.xSize * this.ySize
        for (let b = 0; b < this.bombCount; b = this.bombLocs.length) {
            let bombFlatIndex = getRandomInt(0, gridFlatSize)
            let x = Math.floor(bombFlatIndex / this.xSize)
            let y = Math.floor(bombFlatIndex % this.ySize)
            var res = this.bombLocs.find(e => e[0] == x && e[1] == y)
            if (res) {
                console.log("duplicate bombLoc");
                continue;
            }
            this.bombLocs.push([x,y])
            this.grid[x][y].value = CellValues.BOMB;
        }
        for (let _loc of this.bombLocs) {
            let neiLocs = this.getCellNeighborLocs(_loc[0], _loc[1])
            for (let neiLoc of neiLocs) {
                if (this.grid[neiLoc[0]][neiLoc[1]].value !== CellValues.BOMB) {
                    this.grid[neiLoc[0]][neiLoc[1]].value += 1
                }
            }
        }
        for (let x = 0; x < this.xSize; x++) {
            for (let y = 0; y < this.ySize; y++) {
                if (typeof this.grid[x][y].value === 'number') {
                    this.grid[x][y].value = CellValues[this.grid[x][y].value];
                }
            }
        }
    }

    initGridWithBombLocs() {
        if (this.bombLocs == []) {
            return
        }
        for (let bombLoc of this.bombLocs) {
            this.grid[bombLoc[0]][bombLoc[1]].value = CellValues.BOMB;
        }
        for (let _loc of this.bombLocs) {
            let neiLocs = this.getCellNeighborLocs(_loc[0], _loc[1]);
            for (let neiLoc of neiLocs) {
            if (
                this.grid[neiLoc[0]][neiLoc[1]].value !== CellValues.BOMB
            ) {
                this.grid[neiLoc[0]][neiLoc[1]].value += 1;
            }
            }
        }
        for (let x = 0; x < this.xSize; x++) {
            for (let y = 0; y < this.ySize; y++) {
                if (typeof this.grid[x][y].value === "number") {
                    this.grid[x][y].value = CellValues[this.grid[x][y].value];
                }
            }
        }
    }

    flood(x, y) {
        this.grid[x][y].isRevealed = true
        if (this.grid[x][y].value == CellValues["BOMB"]) {
            this.gameState = GameState.LOSE;
            return;
        }
        this.revealedCount += 1;
        if (this.grid[x][y].value != CellValues[0]) {
            return;
        }
        if (this.revealedCount == (this.xSize * this.ySize - this.bombCount)) {
            this.gameState = GameState.WON;
            return;
        }
        var neiLocs = this.getCellNeighborLocs(x, y);
        if (neiLocs.length == 0) {
            return
        }
        neiLocs.forEach((neiLoc) => {
            var neiX = neiLoc[0];
            var neiY = neiLoc[1];
            var neiIsRevealed = this.grid[neiX][neiY].isRevealed
            if (!neiIsRevealed) {
                this.flood(neiX, neiY);
            }
        })
    }

    getGrid() {
        return this.grid;
    }
}
