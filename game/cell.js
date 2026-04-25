export const CellValues = Object.freeze({
  FLAG: Symbol("🚩"),
  0: Symbol(" "),
  BOMB: Symbol("💣"),
  1: Symbol("1"),
  2: Symbol("2"),
  3: Symbol("3"),
  4: Symbol("4"),
  5: Symbol("5"),
  6: Symbol("6"),
  7: Symbol("7"),
  8: Symbol("8"),
});

export class Cell {
    constructor(x, y, value) {
        this.x = x
        this.y = y
        this.value = value
    }
}
