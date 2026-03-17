/*
rules.js
Validates card plays, special cards, and win conditions
for Card Madness
*/

export const Rules = {
  // ==========================
  // Check if a move is legal
  // ==========================
  isValidMove(selectedCard, topCard) {
    if (!selectedCard || !topCard) return false;

    // match color
    if (selectedCard.color === topCard.color) {
      return true;
    }

    // match value
    if (selectedCard.value === topCard.value) {
      return true;
    }

    // +4 can always be played
    if (selectedCard.value === "+4") {
      return true;
    }

    return false;
  },

  // ==========================
  // Special Card Effects
  // ==========================
  getCardEffect(card) {
    switch (card.value) {
      case "skip":
        return {
          type: "skip",
          message: "Next player skipped!",
        };

      case "reverse":
        return {
          type: "reverse",
          message: "Game direction reversed!",
        };

      case "draw2":
        return {
          type: "draw",
          amount: 2,
          skipNext: true,
          message: "Next player draws 2 cards!",
        };

      case "wild-draw4":
        return {
          type: "draw",
          amount: 4,
          skipNext: true,
          message: "Next player draws 4 cards!",
        };

      default:
        return null;
    }
  },

  // ==========================
  // Check Win Condition
  // ==========================
  checkWin(player) {
    if (player.hand.length === 0) {
      return true;
    }

    return false;
  },

  // ==========================
  // UNO Logic
  // ==========================
  checkUNO(player) {
    if (player.hand.length === 1) {
      return true;
    }

    return false;
  },

  // ==========================
  // UNO Penalty
  // ==========================
  applyUnoPenalty(player) {
    if (player.hand.length === 1 && !player.calledUNO) {
      return {
        penalty: true,
        cardsToDraw: 2,
        message: "UNO not called! Draw 2 cards.",
      };
    }

    return {
      penalty: false,
    };
  },

  // ==========================
  // Verify player owns card
  // ==========================
  verifyOwnership(player, card) {
    return player.hand.some(
      (c) => c.color === card.color && c.value === card.value,
    );
  },

  // ==========================
  // Wild Card Color Selection
  // ==========================
  getBestColor(hand) {
    const counts = { red: 0, yellow: 0, green: 0, blue: 0 };
    hand.forEach((c) => {
      if (counts[c.color] !== undefined) counts[c.color]++;
    });
    return Object.keys(counts).reduce((a, b) =>
      counts[a] >= counts[b] ? a : b,
    );
  },
};
