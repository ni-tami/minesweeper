import { describe, it, expect, vi, afterEach } from "vitest";
import { Grid } from "../src/grid.js";
import { CellStates, CellValues } from "../src/cell.js";
import { GameState } from "../src/state.js";

describe("Grid constructor", () => {
  it("init grid config", () => {
    const grid = new Grid(3, 4, 2);

    expect(grid.xSize).toBe(3);
    expect(grid.ySize).toBe(4);
    expect(grid.bombCount).toBe(2);
    expect(grid.bombLocs).toEqual([]);
    expect(grid.revealedCount).toBe(0);
    expect(grid.gameState).toBe(GameState.INPROGRESS);
  });

  it("error on invalid dimensions", () => {
    expect(() => new Grid(0, 4, 1)).toThrow();
    expect(() => new Grid(4, 0, 1)).toThrow();
  });

  it("error on bomb count greater than or equal to grid size", () => {
    expect(() => new Grid(2, 2, 4)).toThrow("Bomb count must be less than grid size.");
  });
});

describe("Grid.getCellNeighborLocs", () => {
  it("has 8 neighbors for middle cell", () => {
    const grid = new Grid(3, 3, 1);
    const neighbors = grid.getCellNeighborLocs(1, 1);

    expect(neighbors).toHaveLength(8);
  });

  it("has 3 neighbors for corner cell", () => {
    const grid = new Grid(3, 3, 1);
    const neighbors = grid.getCellNeighborLocs(0, 0);

    expect(neighbors).toEqual(
      expect.arrayContaining([
        [1, 0],
        [0, 1],
        [1, 1],
      ]),
    );
    expect(neighbors).toHaveLength(3);
  });

  it("error on out-of-bound coordinates", () => {
    const grid = new Grid(3, 3, 1);
    expect(() => grid.getCellNeighborLocs(-1, 0)).toThrow();
  });
});

describe("Grid.initEmptyGrid", () => {
  it("init correct dimensions", () => {
    const grid = new Grid(2, 3, 1);
    const cells = grid.initEmptyGrid();

    expect(cells).toHaveLength(2);
    expect(cells[0]).toHaveLength(3);
  });

  it("init cells with 0s", () => {
    const grid = new Grid(2, 2, 1);
    const cells = grid.initEmptyGrid();

    expect(cells[1][1].state).toBe(CellStates.COVERED);
    expect(cells[1][1].value).toBe(0);
  });
});

describe("Grid.initGrid", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("places exactly bombCount bombs", () => {
    const grid = new Grid(3, 3, 2);

    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0 / 9)
      .mockReturnValueOnce(4 / 9);

    const cells = grid.initGrid();

    const bombCells = cells.flat().filter((c) => c.value === CellValues.BOMB);
    expect(bombCells).toHaveLength(2);
    expect(grid.bombLocs).toHaveLength(2);
  });

  it("converts non-bomb numeric values to CellValues symbols", () => {
    const grid = new Grid(2, 2, 1);

    vi.spyOn(Math, "random").mockReturnValue(0);

    const cells = grid.initGrid();
    const nonBomb = cells.flat().find((c) => c.value !== CellValues.BOMB);

    expect(typeof nonBomb.value).toBe("symbol");
  });
});

describe("Grid.initGridWithBombLocs", () => {
  it("error on passed empty bombLocs", () => {
    const grid = new Grid(2, 2, 1, []);
    expect(() => grid.initGridWithBombLocs()).toThrow();
  });

  it("init grid with bombLocs", () => {
    const grid = new Grid(3, 3, 2, [
      [0, 0],
      [2, 2],
    ]);

    const cells = grid.initGridWithBombLocs();

    expect(cells[0][0].value).toBe(CellValues.BOMB);
    expect(cells[2][2].value).toBe(CellValues.BOMB);
  });
});
