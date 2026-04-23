import { gameState } from "./state.js";
import { isCardPlayable } from "./engine.js";
import { playCard } from "../main.js";

export function renderPlayerHand() {
  const handContainer = document.getElementById("player-hand");
  if (!handContainer) return;
  handContainer.innerHTML = "";

  gameState.players.player.forEach((card, index) => {
    const cardElement = createCardElement(card, true, index);
    handContainer.appendChild(cardElement);
  });
}

export function renderOpponentHands() {
  ["opponentTop", "opponentLeft", "opponentRight"].forEach((opponent) => {
    const container = document.getElementById(
      opponent.replace("opponent", "opponent-").toLowerCase(),
    );
    if (!container) return;
    container.innerHTML = "";

    gameState.players[opponent].forEach(() => {
      const cardBack = document.createElement("div");
      cardBack.className = "card card-back";
      container.appendChild(cardBack);
    });
  });
}

export function renderDiscardPile() {
  const pile = document.getElementById("discard-pile");
  if (!pile) return;
  pile.innerHTML = "";

  if (gameState.discardPile.length > 0) {
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    const cardElement = createCardElement(topCard, false);
    const randomRotation = Math.random() * 10 - 5;
    cardElement.style.setProperty("--rotation", `${randomRotation}deg`);
    pile.appendChild(cardElement);
  }
}

function createCardElement(card, isClickable = false, cardIndex = null) {
  const cardDiv = document.createElement("div");
  cardDiv.className = `card card-${card.color}`;

  const colors = {
    red: "#991240",
    yellow: "#E1AD01",
    green: "#008080",
    blue: "#2E5BFF",
    wild: "#333",
  };
  const cardColor = colors[card.color] || "#333";
  let svgContent = "";

  if (!isNaN(card.value)) {
    // STANDARD NUMBER CARDS
    svgContent = `
        <svg viewBox="0 0 256 384" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="10" width="236" height="364" rx="12" fill="${cardColor}" stroke="currentColor" stroke-width="4" />
            <rect x="4" y="4" width="248" height="376" rx="16" fill="none" stroke="black" stroke-width="2" />
            <path d="M 100 10 L 246 10 L 246 180 Z" fill="currentColor" opacity=".3" />
            <path d="M 10 200 L 10 374 L 156 374 Z" fill="currentColor" opacity=".3" />
            <rect x="68" y="132" width="120" height="120" rx="10" fill="white" stroke="${cardColor}" stroke-width="3" transform="rotate(45, 128, 192)" />
            <text x="128" y="230" font-family="Verdana" font-weight="900" font-size="100" fill="#333" text-anchor="middle">${card.value}</text>
            <rect x="80" y="340" width="96" height="6" rx="3" fill="currentColor" />
        </svg>`;
  } else {
    switch (card.value) {
      case "draw2":
        svgContent = `
<svg viewBox="0 0 256 384" xmlns="http://www.w3.org/2000/svg">
                      <rect x="10" y="10" width="236" height="364" rx="12" fill="${cardColor}" stroke="currentColor" stroke-width="4"></rect>
                      <rect x="4" y="4" width="248" height="376" rx="16" fill="none" stroke="black" stroke-width="2"></rect>
                      <path d="M 100 10 L 246 10 L 246 180 Z" fill="currentColor" opacity=".3"></path>
                      <path d="M 10 200 L 10 374 L 156 374 Z" fill="currentColor" opacity=".3"></path>
                      <text x="20" y="45" font-family="Verdana" font-weight="900" font-size="22" fill="white"> +2 </text>
                      <rect x="68" y="132" width="120" height="120" rx="10" fill="black" stroke="#333" stroke-width="2" transform="rotate(45, 128, 192)"></rect>
                      <text x="120" y="215" font-family="Verdana" font-weight="900" font-size="75" fill="white" text-anchor="middle"> +2 </text>
                      <rect x="80" y="340" width="96" height="6" rx="3" fill="currentColor"></rect>
                  </svg>`;
        break;
      case "reverse":
        svgContent = `
                <svg viewBox="0 0 256 384" xmlns="http://www.w3.org/2000/svg">
                    <rect x="10" y="10" width="236" height="364" rx="12" fill="${cardColor}" stroke="currentColor" stroke-width="4" />
                    <rect x="4" y="4" width="248" height="376" rx="16" fill="none" stroke="black" stroke-width="2" />
                    <path d="M 100 10 L 246 10 L 246 180 Z" fill="currentColor" opacity=".3" />
                    <path d="M 10 200 L 10 374 L 156 374 Z" fill="currentColor" opacity=".3" />
                    <g transform="translate(18, 22) scale(0.6)" fill="currentColor">
                        <path d="M 10 17 C 10 5, 45 5, 45 22 L 55 22 L 42 42 L 29 22 L 38 22 C 38 12, 20 12, 20 17 Z" />
                        <path d="M 50 44 C 50 56, 15 56, 15 39 L 5 39 L 18 19 L 31 39 L 22 39 C 22 47, 40 47, 40 44 Z" />
                    </g>
                    <rect x="68" y="132" width="120" height="120" rx="10" fill="black" stroke="black" stroke-width="2" transform="rotate(45, 128, 192)" />
                    <g fill="white">
                        <path d="M 100 170 C 100 150, 155 150, 155 175 L 165 175 L 152 195 L 139 175 L 148 175 C 148 162, 110 162, 110 170 Z" />
                        <path d="M 156 214 C 156 234, 101 234, 101 209 L 91 209 L 104 189 L 117 209 L 108 209 C 108 222, 146 222, 146 214 Z" />
                    </g>
                    <rect x="80" y="340" width="96" height="6" rx="3" fill="currentColor" />
                </svg>`;
        break;
      case "skip":
        svgContent = `
                  <svg viewBox="0 0 256 384" xmlns="http://www.w3.org/2000/svg">
                      <rect x="10" y="10" width="236" height="364" rx="12" fill="${cardColor}" stroke="currentColor" stroke-width="4" />
                      <rect x="4" y="4" width="248" height="376" rx="16" fill="none" stroke="black" stroke-width="2" />
                      <path d="M 100 10 L 246 10 L 246 180 Z" fill="currentColor" opacity=".3" />
                      <path d="M 10 200 L 10 374 L 156 374 Z" fill="currentColor" opacity=".3" />
                      <circle cx="32" cy="36" r="10" fill="none" stroke="currentColor" stroke-width="3" />
                      <line x1="26" y1="42" x2="38" y2="30" stroke="currentColor" stroke-width="3" />
                      <rect x="68" y="132" width="120" height="120" rx="10" fill="black" stroke="black" stroke-width="2" transform="rotate(45, 128, 192)" />
                      <g fill="white">
                          <path d="M 128 152 A 40 40 0 1 0 128 232 A 40 40 0 1 0 128 152 Z M 128 162 A 30 30 0 0 1 150.2 171.8 L 105.8 216.2 A 30 30 0 0 1 128 162 Z M 128 222 A 30 30 0 0 1 105.8 212.2 L 150.2 167.8 A 30 30 0 0 1 128 222 Z" />
                      </g>
                      <rect x="80" y="340" width="96" height="6" rx="3" fill="currentColor" />
                  </svg>`;
        break;
      case "combine":
        svgContent = `
            <svg viewBox="0 0 256 384" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="10" width="236" height="364" rx="12" fill="${cardColor}" stroke="currentColor" stroke-width="4" />
                <rect x="4" y="4" width="248" height="376" rx="16" fill="none" stroke="black" stroke-width="2" />
                <path d="M 100 10 L 246 10 L 246 180 Z" fill="currentColor" opacity=".3" />
                <path d="M 10 200 L 10 374 L 156 374 Z" fill="currentColor" opacity=".3" />
                <rect x="68" y="132" width="120" height="120" rx="10" fill="black" stroke="white" stroke-width="2" transform="rotate(45, 128, 192)" />
                <text x="128" y="210" font-family="Verdana" font-weight="900" font-size="40" fill="white" text-anchor="middle">COM</text>
                <rect x="80" y="340" width="96" height="6" rx="3" fill="currentColor" />
            </svg>`;
        break;

      case "wild-draw4":
        const maskId = `mask-${Math.random().toString(36).substring(2, 9)}`;
        svgContent = `
          <svg width="256" height="384" viewBox="0 0 256 384" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="110" width="236" height="170" fill="#fff" rx="12"/><defs><mask id="a"><path fill="#fff" d="M0 0h256v384H0z"/><path d="m-56.325 171.7 393.923-69.46 17.364 98.48-393.923 69.46z"/><text x="128" y="215" font-family="Impact, sans-serif" font-weight="900" font-size="80" fill="#fff" text-anchor="middle">+4 </text></mask></defs><path fill="#1a1a1a" mask="url(#a)" d="M8 8h240v368H8z"/><path d="M8 60V8h52m136 368h52v-52" fill="none" stroke="#000" stroke-width="6"/><text x="30" y="35" font-family="monospace" font-weight="bold" font-size="18" fill="#fff">Special</text></svg>
          `;
        break;
      case "wild":
        svgContent = `
          <svg width="256" height="384" viewBox="0 0 256 384" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="110" width="236" height="170" fill="#fff" rx="12"/><defs><mask id="a"><path fill="#fff" d="M0 0h256v384H0z"/><path d="m-56.325 171.7 393.923-69.46 17.364 98.48-393.923 69.46z"/></mask></defs><rect x="8" y="8" width="240" height="368" rx="0" mask="url(#a)"/><g transform="rotate(45 128 192)"><path d="M68 132h60v60H68Z" fill="#2e5bff"/><path d="M128 132h60v60h-60Z" fill="#d90368"/><path d="M68 192h60v60H68Z" fill="#ff5733"/><path d="M128 192h60v60h-60Z" fill="#a2ff00"/><rect x="68" y="132" width="120" height="120" fill="none" stroke="#fff" stroke-width="2" rx="2"/></g><path d="M8 60V8h52m136 368h52v-52" fill="none" stroke="#000" stroke-width="6"/><text x="30" y="35" font-family="monospace" fill="#fff" font-weight="bold" font-size="18">Special</text></svg>`;
        break;
    }
  }

  cardDiv.innerHTML = svgContent;

  if (isClickable) {
    cardDiv.addEventListener("click", () => playCard(cardIndex));
    if (isCardPlayable(card)) cardDiv.classList.add("playable");
  }

  return cardDiv;
}

export function showColorPicker() {
  document.getElementById("color-picker").style.display = "flex";
}

export function updateNotification(message = null) {
  const notification = document.getElementById("game-notifications");
  if (!notification) return;

  if (message) {
    notification.textContent = message;
  } else {
    notification.textContent =
      gameState.currentPlayer === "player"
        ? "Your Turn"
        : `${gameState.currentPlayer}'s Turn`;
  }
}

export function updateTurnVisuals() {
  const idMap = {
    player: "player-hand",
    opponentLeft: "opponent-left",
    opponentTop: "opponent-top",
    opponentRight: "opponent-right",
  };

  document.querySelectorAll(".hand-container").forEach((container) => {
    container.classList.remove("active-turn");
  });

  const activeId = idMap[gameState.currentPlayer];
  const activeContainer = document.getElementById(activeId);
  if (activeContainer) {
    activeContainer.classList.add("active-turn");
  }
}

export function showWinScreen(winner) {
  const winScreen = document.getElementById("win-screen");
  const winnerText = document.getElementById("winner-name");

  const displayName =
    winner === "player"
      ? "YOU WIN!"
      : `${winner.replace(/([A-Z])/g, " $1").toUpperCase()} WINS!`;

  winnerText.textContent = displayName;
  winScreen.style.display = "flex";
}
