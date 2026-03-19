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

// Start the game - render everything
function startGame() {
  renderPlayerHand();
  renderOpponentHands();
  renderDiscardPile();
  updateNotification();
  setupColorPicker();

  console.log("Game started!");
  console.log("Your hand:", players.player);
}

// Wire up color picker buttons
function setupColorPicker() {
  document.querySelectorAll(".color-btn").forEach((btn) => {
    btn.addEventListener("click", () => pickColor(btn.dataset.color));
  });
}

// Show color picker modal (called when human plays a wild)
function showColorPicker() {
  document.getElementById("color-picker").style.display = "flex";
}

// Called when player clicks a color button
function pickColor(color) {
  const topCard = discardPile[discardPile.length - 1];
  topCard.color = color;
  document.getElementById("color-picker").style.display = "none";
  renderDiscardPile();
  applyCardEffect(topCard);
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

// Render the top card of discard pile
function renderDiscardPile() {
  const pile = document.getElementById("discard-pile");
  pile.innerHTML = "";

  if (discardPile.length > 0) {
    const topCard = discardPile[discardPile.length - 1];
    const cardElement = createCardElement(topCard, false);
    pile.appendChild(cardElement);
  }
}

// Create a card element
function createCardElement(card, isClickable = false, cardIndex = null) {
  const cardDiv = document.createElement("div");
  cardDiv.className = `card card-${card.color}`;
  cardDiv.textContent = card.value.toUpperCase();

  // Add click handler for player's cards
  if (isClickable) {
    cardDiv.addEventListener("click", () => playCard(cardIndex));
    cardDiv.style.cursor = "pointer";

    // Check if card is playable
    if (isCardPlayable(card)) {
      cardDiv.classList.add("playable");
    }
  }

  return cardDiv;
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

  // Check win condition
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

  if (effect && effect.type === "draw") {
    const nextPlayer = getNextPlayerName();
    forceDrawCards(nextPlayer, effect.amount);
    const who = nextPlayer === "player" ? "You draw" : `${nextPlayer} draws`;
    updateNotification(`${who} ${effect.amount} cards!`);
    setTimeout(() => nextTurn(2), 1200);
  } else {
    nextTurn(1);
  }
}

// Move to next player, skipping `steps` positions
function nextTurn(steps = 1) {
  const playerOrder = [
    "player",
    "opponentLeft",
    "opponentTop",
    "opponentRight",
  ];
  let idx = playerOrder.indexOf(currentPlayer);
  for (let i = 0; i < steps; i++) {
    idx = (idx + gameDirection + 4) % 4;
  }
  currentPlayer = playerOrder[idx];

  updateNotification();

  // If it's an opponent's turn, let them play after a delay
  if (currentPlayer !== "player") {
    setTimeout(opponentPlay, 1000);
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
