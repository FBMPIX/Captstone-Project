// main.js
import { Rules } from "./modules/rules.js";

// Card colors and values
const COLORS = ["red", "yellow", "green", "blue"];
const VALUES = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "skip",
  "reverse",
  "draw2",
];

// Game state
let deck = [];
let discardPile = [];
let players = {
  player: [],
  opponentTop: [],
  opponentLeft: [],
  opponentRight: [],
};
let currentPlayer = "player";
let gameDirection = 1; // 1 = clockwise, -1 = counterclockwise

// Initialize the game when page loads
window.addEventListener("DOMContentLoaded", () => {
  initGame();
});

function initGame() {
  createDeck();
  shuffleDeck();
  dealCards();
  startGame();
}

// Create a full Uno deck
function createDeck() {
  deck = [];

  // Regular colored cards
  COLORS.forEach((color) => {
    // One 0 card per color
    deck.push({ color, value: "0" });

    // Two of each 1-9 and action cards
    VALUES.slice(1).forEach((value) => {
      deck.push({ color, value });
      deck.push({ color, value });
    });
  });

  // Wild cards (4 of each)
  for (let i = 0; i < 4; i++) {
    deck.push({ color: "wild", value: "wild" });
    deck.push({ color: "wild", value: "wild-draw4" });
  }

  console.log(`Deck created with ${deck.length} cards`);
}

// Shuffle the deck
function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

// Deal 7 cards to each player
function dealCards() {
  const playerNames = Object.keys(players);

  for (let i = 0; i < 7; i++) {
    playerNames.forEach((playerName) => {
      const card = deck.pop();
      players[playerName].push(card);
    });
  }

  // Place first card on discard pile (make sure it's not a wild)
  let firstCard;
  do {
    firstCard = deck.pop();
  } while (firstCard.color === "wild");

  discardPile.push(firstCard);
}

// render everything
function startGame() {
  currentPlayer = "player";
  gameDirection = 1;

  renderPlayerHand();
  renderOpponentHands();
  renderDiscardPile();
  setupColorPicker();

  nextTurn(0);

  console.log("Game started!");
  console.log("Your hand:", players.player);
}

// Wire up color picker buttons
function setupColorPicker() {
  document.querySelectorAll(".color-btn").forEach((btn) => {
    btn.addEventListener("click", () => pickColor(btn.dataset.color));
  });
}

// Show color picker modal (called when player plays a wild)
function showColorPicker() {
  document.getElementById("color-picker").style.display = "flex";
}

// Called when player clicks a color button
function pickColor(color) {
  const topCard = discardPile[discardPile.length - 1];
  topCard.color = color;

  document.getElementById("color-picker").style.display = "none";
  renderDiscardPile();

  // Check if it was a +4 or just a Wild
  if (topCard.value === "wild-draw4") {
    applyCardEffect(topCard);
  } else {
    nextTurn(1); // Just a regular Wild, move to next player
  }
}

// Render player's hand at bottom
function renderPlayerHand() {
  const handContainer = document.getElementById("player-hand");
  handContainer.innerHTML = "";

  players.player.forEach((card, index) => {
    const cardElement = createCardElement(card, true, index);
    handContainer.appendChild(cardElement);
  });
}

// Render opponent hands (just show card backs)
function renderOpponentHands() {
  ["opponentTop", "opponentLeft", "opponentRight"].forEach((opponent) => {
    const container = document.getElementById(
      opponent.replace("opponent", "opponent-").toLowerCase(),
    );
    container.innerHTML = "";

    players[opponent].forEach(() => {
      const cardBack = document.createElement("div");
      cardBack.className = "card card-back";
      container.appendChild(cardBack);
    });
  });
}

function renderDiscardPile() {
  const pile = document.getElementById("discard-pile");

  pile.innerHTML = "";

  if (discardPile.length > 0) {
    const topCard = discardPile[discardPile.length - 1];
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

  // Determine which SVG design to use
  // TODO: Fix Unique and wild cards
  if (!isNaN(card.value)) {
    // STANDARD NUMBER CARDS
    svgContent = `
      <svg viewBox="0 0 256 384" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="236" height="364" rx="12" fill="${cardcolor}" stroke="currentColor" stroke-width="4"/><rect x="4" y="4" width="248" height="376" rx="16" fill="none" stroke="#000" stroke-width="2"/><path d="M100 10h146v170ZM10 200v174h146Z" fill="currentColor" opacity=".3"/><rect x="68" y="132" width="120" height="120" rx="10" fill="#fff" stroke="${cardcolor}" stroke-width="3" transform="rotate(45 128 192)"/><text x="128" y="230" font-family="Verdana" font-weight="900" font-size="100" fill="#333" text-anchor="middle">${card.value}</text><rect x="80" y="340" width="96" height="6" rx="3" fill="currentColor"/></svg>`;
  } else {
    switch (card.value) {
      case "draw2":
        svgContent = `
          <svg viewBox="0 0 256 384" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="236" height="364" rx="12" fill="${cardcolor}" stroke="currentColor" stroke-width="4"/><rect x="4" y="4" width="248" height="376" rx="16" fill="none" stroke="#000" stroke-width="2"/><path d="M100 10h146v170ZM10 200v174h146Z" fill="currentColor" opacity=".3"/><text x="20" y="45" font-family="Verdana" font-weight="900" font-size="22" fill="currentColor"> +2 </text><rect x="68" y="132" width="120" height="120" rx="10" fill="currentColor" stroke="#000" stroke-width="2" transform="rotate(45 128 192)"/><text x="120" y="215" font-family="Verdana" font-weight="900" font-size="75" fill="#fff" text-anchor="middle"> +2 </text><rect x="80" y="340" width="96" height="6" rx="3" fill="currentColor"/></svg>`;
        break;
      case "reverse":
        svgContent = `
          <svg viewBox="0 0 256 384" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="236" height="364" rx="12" fill="${cardcolor}" stroke="#fff" stroke-width="4"/><rect x="4" y="4" width="248" height="376" rx="16" fill="none" stroke="#000" stroke-width="2"/><path d="M100 10h146v170ZM10 200v174h146Z" fill="#fff" opacity=".2"/><rect x="68" y="132" width="120" height="120" rx="10" fill="currentColor" stroke="#000" stroke-width="2" transform="rotate(45 128 192)"/><g fill="#fff"><path d="M101.6 174c0-14.4 42-14.4 42 6h12L140 204l-15.6-24h10.8c0-12-21.6-12-21.6-6Z"/><path d="M154.4 210c0 14.4-42 14.4-42-6h-12l15.6-24 15.6 24h-10.8c0 9.6 21.6 9.6 21.6 6Z"/></g><rect x="80" y="340" width="96" height="6" rx="3" fill="#fff" opacity=".5"/></svg>`;
        break;
      case "skip":
        svgContent = `
          <svg viewBox="0 0 256 384" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="236" height="364" rx="12" fill="${cardcolor}" stroke="currentColor" stroke-width="4"/><rect x="4" y="4" width="248" height="376" rx="16" fill="none" stroke="#000" stroke-width="2"/><path d="M100 10h146v170ZM10 200v174h146Z" fill="currentColor" opacity=".3"/><circle cx="32" cy="36" r="10" fill="none" stroke="currentColor" stroke-width="3"/><path stroke="currentColor" stroke-width="3" d="m26 42 12-12"/><rect x="68" y="132" width="120" height="120" rx="10" fill="currentColor" stroke="#000" stroke-width="2" transform="rotate(45 128 192)"/><path d="M128 152a40 40 0 1 0 0 80 40 40 0 1 0 0-80m0 10a30 30 0 0 1 22.2 9.8l-44.4 44.4A30 30 0 0 1 128 162m0 60a30 30 0 0 1-22.2-9.8l44.4-44.4A30 30 0 0 1 128 222" fill="#fff"/><rect x="80" y="340" width="96" height="6" rx="3" fill="currentColor"/></svg>`;
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

function getHexColor(colorName) {
  const map = {
    red: "#991240",
    yellow: "#E1AD01",
    green: "#008080",
    blue: "#2E5BFF",
    wild: "#333",
  };
  return map[colorName] || "#333";
}

function updateTurnVisuals(activeId) {
  // Remove the active class from everyone
  document.querySelectorAll(".hand-container").forEach((container) => {
    container.classList.remove("active-turn");
    container.parentElement.classList.remove("active-turn"); // For the side/player containers
  });

  // Add it to the current player's container
  const activeContainer = document.getElementById(activeId);
  if (activeContainer) {
    activeContainer.classList.add("active-turn");
    activeContainer.parentElement.classList.add("active-turn");
  }
}

// Check if a card can be played
function isCardPlayable(card) {
  const topCard = discardPile[discardPile.length - 1];

  // Wild cards can always be played
  if (card.color === "wild") return true;

  // Match color or value
  return card.color === topCard.color || card.value === topCard.value;
}

// Play a card from player's hand
function playCard(cardIndex) {
  if (currentPlayer !== "player") {
    updateNotification("Not your turn!");
    return;
  }

  const card = players.player[cardIndex];

  if (!isCardPlayable(card)) {
    updateNotification("Cannot play that card!");
    return;
  }

  // Remove card from hand and add to discard pile
  players.player.splice(cardIndex, 1);
  discardPile.push(card);

  // NOTE: Will be making "You Win" Screen in the future.
  if (players.player.length === 0) {
    updateNotification("You win!");
    return;
  }

  // Re-render
  renderPlayerHand();
  renderDiscardPile();

  // Wild cards require color selection before advancing the turn
  if (card.color === "wild") {
    showColorPicker();
    return;
  }

  applyCardEffect(card);
}

// Get the name of the next player without advancing currentPlayer
function getNextPlayerName() {
  const playerOrder = [
    "player",
    "opponentLeft",
    "opponentTop",
    "opponentRight",
  ];
  const currentIndex = playerOrder.indexOf(currentPlayer);
  return playerOrder[(currentIndex + gameDirection + 4) % 4];
}

// Force a player to draw N cards from the deck
function forceDrawCards(playerName, count) {
  for (let i = 0; i < count; i++) {
    if (deck.length > 0) players[playerName].push(deck.pop());
  }
  if (playerName === "player") {
    renderPlayerHand();
  } else {
    renderOpponentHands();
  }
}

// Apply the effect of a played card, then advance the turn
function applyCardEffect(card) {
  const effect = Rules.getCardEffect(card);

  if (effect && effect.type === "reverse") {
    gameDirection *= -1; // Flip logic

    document.body.classList.toggle("direction-reversed", gameDirection === -1);

    updateNotification("Reverse!");
    nextTurn(1);
    return;
  }

  if (effect && effect.type === "skip") {
    updateNotification("Player Skipped!");
    nextTurn(2); // nextTurn now handles the negative direction internally
    return;
  }

  if (effect && effect.type === "draw") {
    const nextPlayer = getNextPlayerName();
    forceDrawCards(nextPlayer, effect.amount);
    updateNotification(`${nextPlayer} draws ${effect.amount}!`);
    nextTurn(2); // Skip the person who had to draw
    return;
  }

  nextTurn(1);
}
// Move to next player, skipping `steps` positions
function nextTurn(steps = 1) {
  const playerOrder = [
    "player",
    "opponentLeft",
    "opponentTop",
    "opponentRight",
  ];
  const idMap = {
    player: "player-hand",
    opponentLeft: "opponent-left",
    opponentTop: "opponent-top",
    opponentRight: "opponent-right",
  };

  let idx = playerOrder.indexOf(currentPlayer);

  // Calculate index respecting the reverse direction
  idx = (idx + steps * gameDirection + 4) % 4;
  currentPlayer = playerOrder[idx];

  // Toggle Focus Mode (Broken)
  document.body.classList.toggle("opponent-active", currentPlayer !== "player");

  // Clear previous active states
  document.querySelectorAll(".hand-container").forEach((container) => {
    container.classList.remove("active-turn", "thinking");
  });

  // Set new active state
  const activeId = idMap[currentPlayer];
  const activeContainer = document.getElementById(activeId);

  if (activeContainer) {
    activeContainer.classList.add("active-turn");

    if (currentPlayer === "player") {
      activeContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      // Add a thinking class to trigger the AI glow animation from CSS
      activeContainer.classList.add("thinking");
    }
  }

  // Update the directional arrow rotation in the center
  const centerZone = document.querySelector(".center-play-zone");
  centerZone.classList.toggle("direction-clockwise", gameDirection === 1);
  centerZone.classList.toggle("direction-counter", gameDirection === -1);

  updateNotification();

  if (currentPlayer !== "player") {
    setTimeout(opponentPlay, 1200);
  }
}

// Simple AI for opponents
function opponentPlay() {
  const hand = players[currentPlayer];
  const topCard = discardPile[discardPile.length - 1];

  // Find playable cards
  const playableCards = hand.filter((card) => isCardPlayable(card));

  if (playableCards.length > 0) {
    // Play first playable card
    const cardToPlay = playableCards[0];
    const cardIndex = hand.indexOf(cardToPlay);
    hand.splice(cardIndex, 1);
    discardPile.push(cardToPlay);

    // Auto-pick best color for wild cards
    if (cardToPlay.color === "wild") {
      discardPile[discardPile.length - 1].color = Rules.getBestColor(hand);
    }

    renderOpponentHands();
    renderDiscardPile();
    applyCardEffect(cardToPlay);
  } else {
    // Draw a card
    if (deck.length > 0) {
      hand.push(deck.pop());
      renderOpponentHands();
    }
    nextTurn(1);
  }
}

// Update game notification
function updateNotification(message = null) {
  const notification = document.getElementById("game-notifications");

  if (message) {
    notification.textContent = message;
  } else {
    notification.textContent =
      currentPlayer === "player" ? "Your Turn" : `${currentPlayer}'s Turn`;
  }
}

// Draw card button functionality
document.addEventListener("DOMContentLoaded", () => {
  const drawDeck = document.getElementById("main-draw-deck");

  drawDeck.addEventListener("click", () => {
    if (currentPlayer === "player" && deck.length > 0) {
      const drawnCard = deck.pop();
      players.player.push(drawnCard);
      renderPlayerHand();
      updateNotification("Card drawn. Click to play or end turn.");
    }
  });
});
