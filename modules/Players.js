class UnoGame {
  constructor(playerNames) {
    this.players = playerNames.map(name => ({ name, hand: [] }));
    this.deck = [];
    this.discardPile = [];
    this.currentPlayerIndex = 0;
    this.direction = 1; // 1 for clockwise, -1 for counter clockwise
  }

  skipNextPlayer() {
    this.currentPlayerIndex = this.getNextPlayer(2);
  }

  getNextPlayer(steps = 1) {
    return (this.currentPlayerIndex + (steps * this.direction) + this.players.length) % this.players.length;
  }

  reverseTurnOrder() {
    this.direction *= -1;
  }
}

// export {UnoGame};