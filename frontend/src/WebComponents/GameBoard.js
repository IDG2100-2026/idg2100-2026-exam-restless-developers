import "./PokerDie.js";

class GameBoard extends HTMLElement {
  constructor() {
    super();
    this._dice = [1, 1, 1, 1, 1];
    this._held = [false, false, false, false, false];
    this._rollsLeft = 3;
    this._isMyTurn = false;
    this._boardColor = "#facc15";
    this._onDieToggle = (e) => {
      const { index, held } = e.detail;
      this._held[index] = held;
    };
    this._onRoll = () => {
      if (!this._isMyTurn || this._rollsLeft === 0) return;
      this.dispatchEvent(new CustomEvent("board-roll", {
        bubbles: true,
        detail: { held: [...this._held] },
      }));
    };
    this._onEndTurn = () => {
      if (!this._isMyTurn || this._rollsLeft !== 0) return;
      this.dispatchEvent(new CustomEvent("board-end-turn", { bubbles: true }));
    };
  }

  static get observedAttributes() {
    return ["dice", "held", "rolls-left", "my-turn", "board-color"];
  }

  connectedCallback() {
    this.addEventListener("die-toggle", this._onDieToggle);
    this.render();
  }

  disconnectedCallback() {
    this.removeEventListener("die-toggle", this._onDieToggle);
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === "dice" && newVal) this._dice = JSON.parse(newVal);
    if (name === "held" && newVal) this._held = JSON.parse(newVal);
    if (name === "rolls-left") this._rollsLeft = Number(newVal);
    if (name === "my-turn") this._isMyTurn = newVal !== null && newVal !== "false";
    if (name === "board-color" && newVal) this._boardColor = newVal;
    this.render();
  }

  getHolds() {
    return [...this._held];
  }

  render() {
    const canRoll = this._isMyTurn && this._rollsLeft > 0;
    const canEndTurn = this._isMyTurn && this._rollsLeft === 0;
    const diceDisabled = !this._isMyTurn;
    const small = window.innerWidth <= 420;

    this.innerHTML = `
      <style>
        game-board { display: block; background: ${this._boardColor}; border-radius: 16px; padding: ${small ? "12px" : "24px"}; }
        .dice-row { display: flex; gap: ${small ? "5px" : "16px"}; justify-content: center; margin: ${small ? "12px" : "24px"} 0; }
        .roll-btn {
          display: block; margin: 0 auto; padding: 12px 32px;
          font-size: 1rem; border-radius: 8px; border: none;
          background: ${canRoll ? "#f0c040" : "#aaa"};
          color: #222; cursor: ${canRoll ? "pointer" : "not-allowed"}; font-weight: bold;
        }
        .end-turn-btn {
          display: block; margin: 12px auto 0; padding: 10px 28px;
          font-size: 1rem; border-radius: 8px; border: none;
          background: #4caf50; color: white; cursor: pointer; font-weight: bold;
        }
        .turn-label { text-align: center; font-size: 1rem; margin-bottom: 8px; color: ${this._isMyTurn ? "#f0c040" : "#aaa"}; }
      </style>
      <p class="turn-label">${this._isMyTurn ? "Your turn" : "Waiting for opponent..."}</p>
      <div class="dice-row">
        ${this._dice.map((val, i) => `
          <poker-die value="${val}" index="${i}" ${this._held[i] ? "held" : ""} ${diceDisabled ? "disabled" : ""}></poker-die>
        `).join("")}
      </div>
      <button class="roll-btn" id="roll-btn" ${!canRoll ? "disabled" : ""}>
        Re-roll (${this._rollsLeft} left)
      </button>
      ${canEndTurn ? `<button class="end-turn-btn" id="end-turn-btn">End turn</button>` : ""}
    `;

    this.querySelector("#roll-btn")?.addEventListener("click", this._onRoll);
    this.querySelector("#end-turn-btn")?.addEventListener("click", this._onEndTurn);
  }
}

if (!customElements.get("game-board")) {
  customElements.define("game-board", GameBoard);
}
