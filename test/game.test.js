import { describe, it, expect } from "vitest";
import { Game } from "../src/game.js";
import { CellStates, CellValues } from "../src/cell.js";
import { GameState } from "../src/state.js";

describe("Game.revealCell", () => {
  it("reveals a numeric cell", () => {
    const game = new Game({ xSize: 3, ySize: 3, bombCount: 1, bombLocs: [[0, 0]] });
    const result = game.revealCell(1, 1);

    expect(result.initialCells).toHaveLength(1);
    expect(result.initialCells[0]).toMatchObject({
      x: 1,
      y: 1,
      state: CellStates.REVEALED,
      text: "1",
    });
    expect(result.gameState).toBe(GameState.INPROGRESS);
    expect(game.revealedNonBombCount).toBe(1);
  });

  it("floods empty area and numeric borders", () => {
    const game = new Game({
      xSize: 3,
      ySize: 3,
      bombCount: 1,
      bombLocs: [[0, 0]],
    });
    const result = game.revealCell(2, 2);

    expect(result.initialCells).toHaveLength(8);
    expect(game.revealedNonBombCount).toBe(8);
  });

  it("game won on all non bomb revealed", () => {
    const game = new Game({
      xSize: 3,
      ySize: 3,
      bombCount: 1,
      bombLocs: [[1,1]],
    });
    var result = game.revealCell(0, 0);
    result = game.revealCell(0, 1);
    result = game.revealCell(0, 2);
    result = game.revealCell(1, 0);
    result = game.revealCell(1, 2);
    result = game.revealCell(2, 0);
    result = game.revealCell(2, 1);
    result = game.revealCell(2, 2);

    expect(result.initialCells).toHaveLength(1);
    expect(game.revealedNonBombCount).toBe(8);
  });

  it("game lost on bomb revealed / exploded", () => {
    const game = new Game({
      xSize: 2,
      ySize: 2,
      bombCount: 1,
      bombLocs: [[0, 0]],
    });
    const result = game.revealCell(0, 0);

    expect(result.exploded).toBe(true);
    expect(result.gameState).toBe(GameState.LOSE);
    expect(game.getCell(0, 0).state).toBe(CellStates.REVEALED);
  });
});

describe("Game.toggleFlag", () => {
  it("toggle between covered and flagged", () => {
    const game = new Game({ xSize: 2, ySize: 2, bombCount: 1, bombLocs: [[0, 0]] });

    const flagResult = game.toggleFlag(1, 1);
    expect(flagResult.initialCells[0]).toMatchObject({
      state: CellStates.FLAGGED,
      text: CellValues.FLAG.description,
    });
    expect(game.getCell(1, 1).state).toBe(CellStates.FLAGGED);

    const unflagResult = game.toggleFlag(1, 1);
    expect(unflagResult.initialCells[0]).toMatchObject({
      state: CellStates.COVERED,
      text: "",
    });
    expect(game.getCell(1, 1).state).toBe(CellStates.COVERED);
  });
});

describe("Game end state", () => {
  it("ignore reveal/flag after game over", () => {
    const game = new Game({ xSize: 2, ySize: 2, bombCount: 1, bombLocs: [[0, 0]] });
    game.revealCell(0, 0);

    const revealResult = game.revealCell(1, 1);
    const flagResult = game.toggleFlag(1, 1);

    expect(revealResult.initialCells).toHaveLength(0);
    expect(flagResult.initialCells).toHaveLength(0);
    expect(game.getCell(1, 1).state).toBe(CellStates.COVERED);
  });
});

describe("Game snapshot", () => {
  it("serialize game from snapshot", () => {
    const game = new Game({ xSize: 3, ySize: 3, bombCount: 1, bombLocs: [[0, 0]] });
    game.toggleFlag(2, 2);
    game.revealCell(1, 1);

    const snapshot = JSON.parse(game.serialize());
    const restored = Game.fromSnapshot(snapshot);

    expect(restored.getCell(2, 2).state).toBe(CellStates.FLAGGED);
    expect(restored.getCell(1, 1).state).toBe(CellStates.REVEALED);
    expect(restored.gameState).toBe(game.gameState);
    expect(restored.revealedNonBombCount).toBe(game.revealedNonBombCount);
    expect(restored.gridConfig.bombLocs).toEqual([[0, 0]]);
  });
});
