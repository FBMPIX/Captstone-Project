export const Rules = {
  // ==========================
  // Check if a move is legal
  // ==========================
  isValidMove(selectedCard, topCard) {
    if (!selectedCard || !topCard) return false;

    // Wild cards (Wild and Wild-Draw4) are always playable
    if (selectedCard.color === "wild") {
      return true;
    }

    // Match color or value
    return selectedCard.color === topCard.color || selectedCard.value === topCard.value;
  },

  // ==========================
  // Special Card Effects
  // ==========================
  getCardEffect(card) {
    switch (card.value) {
      case "skip":
        return { type: "skip", message: "Next player skipped!", };
      case "reverse":
        return { type: "reverse", message: "Game direction reversed!", };
      case "draw2":
        return { type: "draw",amount: 2,skipNext: true,message: "Next player draws 2 cards!", };
      case "wild-draw4":
        return { type: "draw", amount: 4,skipNext: true,message: "Next player draws 4 cards!", };
      default:
        return null;
    }
  },

  // ==========================
  // Wild Card Color Selection (Simple AI logic)
  // ==========================
  getBestColor(hand) {
    const counts = { red: 0, yellow: 0, green: 0, blue: 0 };

    hand.forEach((c) => {
      if (counts[c.color] !== undefined) counts[c.color]++;
    });

    // Returns the color the player has the most of
    return Object.keys(counts).reduce((a, b) =>
      counts[a] >= counts[b] ? a : b
    );
  },

  // ==========================
  // Win Logic
  // ==========================
  checkWin(hand) {
    return hand.length === 0;
  },
};
