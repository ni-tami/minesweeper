import { Cell, CellValues } from "./cell.js";
import { getRandomInt } from "../utils/index.js";

export class Grid {
    constructor(xSize, ySize, bombCount) {
        if (xSize < 1 | ySize < 1) {
            throw new Error("Invalid grid dimension.");
        }
        if (bombCount >= xSize * ySize) {
            throw new Error("Bomb count must be less than grid size.");
        }
        this.xSize = xSize
        this.ySize = ySize
        this.bombCount = bombCount
        this.grid = []
        this.bombLocs = []
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

    initGrid() {
        var gridFlatSize = this.xSize * this.ySize
        for (let x = 0; x < this.xSize; x++) {
            var row = []
            for (let y = 0; y < this.ySize; y++) {
                row.push(new Cell(x, y, 0))
            }
            this.grid.push(row);            
        }

        var bombIndexes = []
        for (let b = 0; b < this.bombCount; b++) {
            let bombFlatIndex = getRandomInt(0, gridFlatSize)
            let x = Math.floor(bombFlatIndex / this.xSize)
            let y = Math.floor(bombFlatIndex % this.ySize)
            bombIndexes.push([x,y])
            this.grid[x][y].value = CellValues.BOMB;
        }
        for (let _loc of bombIndexes) {
            let neiLocs = this.getCellNeighborLocs(_loc[0], _loc[1])
            for (let neiLoc of neiLocs) {
                if (this.grid[neiLoc[0]][neiLoc[1]].value !== CellValues.BOMB) {
                    this.grid[neiLoc[0]][neiLoc[1]].value += 1
                }
            }
        }
        this.bombLocs = bombIndexes;
    }

    getGrid() {
        return this.grid;
    }
}
