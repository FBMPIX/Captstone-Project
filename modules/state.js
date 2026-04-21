export const gameState = {
  deck: [],
  discardPile: [],
  players: {
    player: [],
    opponentTop: [],
    opponentLeft: [],
    opponentRight: [],
  },
  currentPlayer: "player",
  gameDirection: 1, // 1 = clockwise, -1 = counterclockwise
  isGameOver: false,
};
