import * as State from "./modules/state.js";
import * as Engine from "./modules/engine.js";
import * as UI from "./modules/ui.js";

/**
 * Initializes the game sequence
 */
function initGame() {
  Engine.createDeck();
  Engine.shuffleDeck();
  Engine.dealCards();
  startGame();
}

/**
 * Resets game state and triggers initial renders
 */
function startGame() {
  State.gameState.currentPlayer = "player";
  State.gameState.gameDirection = 1;

  UI.renderPlayerHand();
  UI.renderOpponentHands();
  UI.renderDiscardPile();
  UI.updateTurnVisuals();
  setupColorPicker();

  Engine.nextTurn(0);

  console.log("Game started!");
}

/**
 * Binds UI interactions for the color selection modal
 */
function setupColorPicker() {
  const container = document.getElementById("color-picker");
  // Use event delegation or check if buttons exist
  container.querySelectorAll(".color-btn").forEach((btn) => {
    btn.onclick = () => pickColor(btn.dataset.color);
  });
}

/**
 * Handles logic when a user selects a color for a Wild card
 */
function pickColor(color) {
  const { discardPile } = State.gameState;
  const topCard = discardPile[discardPile.length - 1];

  // Set the "virtual" color of the wild card
  topCard.color = color;

  document.getElementById("color-picker").style.display = "none";
  UI.renderDiscardPile();

  if (topCard.value === "wild-draw4") {
    Engine.applyCardEffect(topCard);
  } else {
    Engine.nextTurn(1);
  }
}

/**
 * Core logic for a player attempting to play a card
 */
export function playCard(cardIndex) {
  const state = State.gameState;
  const card = state.players.player[cardIndex];

  if (card.value === "combine") {
    const specialCount = state.players.player.filter((c) =>
      ["skip", "reverse", "draw2"].includes(c.value),
    ).length;

    if (specialCount < 2) {
      UI.updateNotification("Need at least 2 other special cards to Combine!");
      return;
    }
  }

  if (state.isGameOver || state.currentPlayer !== "player") return;

  if (state.isSelectingCombo) {
    const selectedCard = state.players.player[cardIndex];

    // Only allow selecting Unique cards 
    const isSpecial = ["skip", "reverse", "draw2"].includes(selectedCard.value);

    if (!isSpecial) {
      UI.updateNotification("Pick a Special card (Skip, Reverse, or Draw 2)!");
      return;
    }

    // Prevent selecting the exact same card instance twice
    if (state.comboSelection.includes(cardIndex)) return;

    state.comboSelection.push(cardIndex);
    UI.updateNotification(
      `Selected ${state.comboSelection.length}/2 special cards...`,
    );

    if (state.comboSelection.length === 2) {
      state.isSelectingCombo = false;

      const cardsToCombine = state.comboSelection.map(
        (idx) => state.players.player[idx],
      );

      state.comboSelection
        .sort((a, b) => b - a)
        .forEach((idx) => {
          state.players.player.splice(idx, 1);
        });

      state.comboSelection = [];
      UI.renderPlayerHand();

      Engine.executeCustomCombo(cardsToCombine);
    }
    return;
  }

  // --- NORMAL PLAY LOGIC ---
  if (!Engine.isCardPlayable(card)) {
    UI.updateNotification("Cannot play that card!");
    return;
  }

  state.players.player.splice(cardIndex, 1);
  state.discardPile.push(card);

  UI.renderPlayerHand();
  UI.renderDiscardPile();

  if (state.players.player.length === 0) {
    state.isGameOver = true;
    UI.updateNotification("You win!");
    UI.showWinScreen("player");
    return;
  }

  if (card.color === "wild" || card.value === "wild-draw4") {
    UI.showColorPicker();
    return;
  }

  Engine.applyCardEffect(card);
}

// Entry Point
window.addEventListener("DOMContentLoaded", () => {
  initGame();

  // Draw Deck click handler
  const drawDeckBtn = document.getElementById("main-draw-deck");
  if (drawDeckBtn) {
    drawDeckBtn.addEventListener("click", () => {
      const state = State.gameState;

      // Basic Draw Logic
      if (state.currentPlayer === "player") {
        if (state.deck.length === 0) {
          UI.updateNotification("Deck empty! Reshuffling...");
          return;
        }

        const drawnCard = state.deck.pop();
        state.players.player.push(drawnCard);

        UI.renderPlayerHand();

        // Check if the drawn card can be played immediately
        if (Engine.isCardPlayable(drawnCard)) {
          UI.updateNotification("You drew a playable card!");
        } else {
          UI.updateNotification("No moves. Passing turn...");
          setTimeout(() => Engine.nextTurn(1), 1000);
        }
      }
    });
  }
});
