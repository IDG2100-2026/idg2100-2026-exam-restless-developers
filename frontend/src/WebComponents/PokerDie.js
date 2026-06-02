// Worked on by: marte kaland

// Die values 1-6 map to Spanish poker dice faces: 1=7, 2=8, 3=J, 4=Q, 5=K, 6=A
const FACES = {
  1: { symbol: "7", color: "#333" },
  2: { symbol: "8", color: "#cc0000" },
  3: { symbol: "J", color: "#333" },
  4: { symbol: "Q", color: "#333" },
  5: { symbol: "K", color: "#cc0000" },
  6: { symbol: "A", color: "#cc0000" },
};

class PokerDie extends HTMLElement {
  constructor() {
    super();
    this._onClick = () => {
      if (this.hasAttribute("disabled")) return;
      const held = this.hasAttribute("held");
      if (held) {
        this.removeAttribute("held");
      } else {
        this.setAttribute("held", "");
      }
      if (localStorage.getItem("soundEnabled") === "true") {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        osc.connect(ctx.destination);
        osc.frequency.value = 600;
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
      this.dispatchEvent(new CustomEvent("die-toggle", {
        bubbles: true,
        detail: { index: Number(this.getAttribute("index")), held: !held },
      }));
    };
  }

  static get observedAttributes() {
    return ["value", "held", "disabled"];
  }

  connectedCallback() {
    this.addEventListener("click", this._onClick);
    this.render();
  }

  disconnectedCallback() {
    this.removeEventListener("click", this._onClick);
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const value = Number(this.getAttribute("value")) || 1;
    const held = this.hasAttribute("held");
    const disabled = this.hasAttribute("disabled");
    const face = FACES[value] || FACES[1];
    const size = window.innerWidth <= 420 ? "48px" : "64px";

    const dieStyle = [
      "width:" + size,
      "height:" + size,
      "border-radius:12px",
      `background:${held ? "#f0c040" : "white"}`,
      `border:3px solid ${held ? "#c89a00" : "#333"}`,
      "display:flex",
      "align-items:center",
      "justify-content:center",
      "cursor:" + (disabled ? "default" : "pointer"),
      "transition:background 0.15s,transform 0.1s",
      `transform:${held ? "translateY(-4px)" : "none"}`,
      `opacity:${disabled ? "0.5" : "1"}`,
      "user-select:none",
      "font-size:" + (window.innerWidth <= 420 ? "18px" : "26px"),
      "font-weight:bold",
      "font-family:serif",
    ].join(";");

    this.innerHTML = `
      <div style="${dieStyle}">
        <span style="color:${face.color}">${face.symbol}</span>
      </div>
    `;
  }
}

if (!customElements.get("poker-die")) {
  customElements.define("poker-die", PokerDie);
}
