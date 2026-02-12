class UnoGame {
  constructor(playerNames) {
    this.players = playerNames.map(name => ({ name, hand: [] }));
    this.deck = []; 
    this.discardPile = [];
    this.currentPlayerIndex = 0;
    this.direction = 1; // 1 for clockwise, -1 for counter clockwise
  }

  skipNextPlayer() {
    this.currentPlayerIndex = this.getNextPlayerIndex(2);
  }

  getNextPlayerIndex(steps = 1) {
    return (this.currentPlayerIndex + (steps * this.direction) + this.players.length) % this.players.length;
  }
}