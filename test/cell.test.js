import { describe, it, expect } from "vitest";
import { Cell, CellStates, CellValues } from "../src/cell.js";

describe("Cell", () => {
  it("construct cell with state", () => {
    const cell = new Cell(1, 2, CellValues.BOMB, CellStates.COVERED);

    expect(cell.x).toBe(1);
    expect(cell.y).toBe(2);
    expect(cell.value).toBe(CellValues.BOMB);
    expect(cell.state).toBe(CellStates.COVERED);
  });

  it("getDescription returns description/emoji for symbol values", () => {
    const cell = new Cell(0, 0, CellValues.BOMB, CellStates.COVERED);
    expect(cell.getDescription()).toBe("💣");
  });

  it("getDescription returns string value for numeric values", () => {
    const cell = new Cell(0, 0, 42, CellStates.REVEALED);
    expect(cell.getDescription()).toBe("42");
  });
});
