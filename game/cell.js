export const CellValues = Object.freeze({
  "FLAG": Symbol("🚩"),
  0: Symbol(" "),
  "BOMB": Symbol("💣"),
  1: Symbol("1"),
  2: Symbol("2"),
  3: Symbol("3"),
  4: Symbol("4"),
  5: Symbol("5"),
  6: Symbol("6"),
  7: Symbol("7"),
  8: Symbol("8"),
});

export const CellStates = Object.freeze({
    FLAGGED: "flagged",
    COVERED: "covered",
    REVEALED: "revealed",
})

export class Cell {
    constructor(x, y, value, state) {
        this.x = x
        this.y = y
        this.value = value
        this.state = state
    }
    getDescription() {
        // get description of this.value if it's a symbol, otherwise return the value as string
        if (typeof this.value === 'symbol') {
            return this.value.description;
        }
        return this.value.toString();
    }
}
