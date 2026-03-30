class FlipLetter {
  constructor(container, options = {}) {
    this.container = container;
    this.current = " ";
    this.animating = false;

    this.chars = options.chars || " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?.,:-+/%@&()";
    this.flipDelay = options.flipDelay || 150;

    this._build();
  }

  reset() {
    this.current = " ";
    this.top.textContent = this.current;
    this.bottom.textContent = this.current;
    this.leafFront.textContent = this.current;
    this.leafBack.textContent = this.current;
    this.animating = false;
    this.container.classList.remove("flipping");
    this.leaf.classList.remove("rotate-out");
  }

  _build() {
    if (!this.container) {
      throw new Error("FlipLetter: container element was not found.");
    }

    this.container.classList.add("flip-letter");

    // Static parts (background)
    this.top = document.createElement("div");
    this.top.className = "flip-part top";
    this.top.textContent = this.current;

    this.bottom = document.createElement("div");
    this.bottom.className = "flip-part bottom";
    this.bottom.textContent = this.current;

    // Flipping leaf
    this.leaf = document.createElement("div");
    this.leaf.className = "leaf";

    this.leafFront = document.createElement("div");
    this.leafFront.className = "flip-part top leaf-front";
    this.leafFront.textContent = this.current;

    this.leafBack = document.createElement("div");
    this.leafBack.className = "flip-part bottom leaf-back";
    this.leafBack.textContent = this.current;

    this.leaf.appendChild(this.leafFront);
    this.leaf.appendChild(this.leafBack);

    // Hinge elements
    this.hingeLeft = document.createElement("div");
    this.hingeLeft.className = "hinge left";
    this.hingeRight = document.createElement("div");
    this.hingeRight.className = "hinge right";

    this.container.appendChild(this.top);
    this.container.appendChild(this.bottom);
    this.container.appendChild(this.leaf);
    this.container.appendChild(this.hingeLeft);
    this.container.appendChild(this.hingeRight);
  }

  _randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }

  _forceRestartAnimation(el, className) {
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
  }

  setChar(char) {
    const next = String(char).toUpperCase().slice(0, 1) || " ";
    if (next === this.current || this.animating) return;

    this.animating = true;
    this.container.classList.add("flipping");

    // We want to flip through the characters list sequentially from current to next
    const startIndex = this.chars.indexOf(this.current);
    const endIndex = this.chars.indexOf(next);

    const startIdx = startIndex === -1 ? 0 : startIndex;

    let currentIndexInSequence = startIdx;

    const tick = () => {
      // Find the next character in our sequence
      currentIndexInSequence = (currentIndexInSequence + 1) % this.chars.length;
      const charToUse = this.chars[currentIndexInSequence];
      const prevChar = this.current;

      // The top static part reveals the NEW character as the flap falls.
      this.top.textContent = charToUse;
      // The bottom static part shows the OLD character until covered.
      this.bottom.textContent = prevChar;

      // The leaf front shows the OLD character (top half).
      this.leafFront.textContent = prevChar;
      // The leaf back shows the NEW character (bottom half), inverted via CSS.
      this.leafBack.textContent = charToUse;

      this._forceRestartAnimation(this.leaf, "rotate-out");

      // Update current to charToUse for the next step's "previous"
      this.current = charToUse;

      if (this.current === next) {
        setTimeout(() => {
          this.container.classList.remove("flipping");
          this.animating = false;
        }, this.flipDelay);
      } else {
        setTimeout(tick, this.flipDelay);
      }
    };

    tick();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const host = document.getElementById("flip-letter");
  if (!host) return;

  const flip = new FlipLetter(host, {
    flipDelay: 150
  });

  const input = document.getElementById("target-char");
  const flipBtn = document.getElementById("flip-btn");
  const resetBtn = document.getElementById("reset-btn");

  if (flipBtn && input) {
    flipBtn.addEventListener("click", () => {
      const val = input.value.trim();
      if (val) {
        flip.setChar(val);
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      flip.reset();
      if (input) input.value = "";
    });
  }
});