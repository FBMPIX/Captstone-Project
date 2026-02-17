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
    // ((0+(1*1)+4)%4)-4  = 2
    // moves clockwise 2 steps.
    // ((0+(1*-1)+4)%4)-4 = -2
    // moves counterclockwise 2 steps

    return ((this.currentPlayerIndex + (steps * this.direction) + this.players.length) % this.players.length)-4;
  }
}

// export {UnoGame};