import { Rules } from "./rules.js";
import { COLORS, VALUES, PLAYER_ORDER } from "./constants.js"; // Fixed: Case sensitivity
import { gameState } from "./state.js";
import * as UI from "./ui.js";

export function createDeck() {
  gameState.deck = [];
  COLORS.forEach((color) => {
    gameState.deck.push({ color, value: "0" });
    VALUES.slice(1).forEach((value) => {
      gameState.deck.push({ color, value });
      gameState.deck.push({ color, value });
    });
  });

  for (let i = 0; i < 4; i++) {
    gameState.deck.push({ color: "wild", value: "wild" });
    gameState.deck.push({ color: "wild", value: "wild-draw4" });
  }
}

export function shuffleDeck() {
  const deck = gameState.deck;
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

export function dealCards() {
  const { deck, players, discardPile } = gameState;
  const playerNames = Object.keys(players);

  for (let i = 0; i < 7; i++) {
    playerNames.forEach((playerName) => {
      if (deck.length > 0) players[playerName].push(deck.pop());
    });
  }

  let firstCard;
  do {
    firstCard = deck.pop();
  } while (firstCard.color === "wild");

  discardPile.push(firstCard);
}

export function isCardPlayable(card) {
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  return Rules.isValidMove(card, topCard); 
}

export function getNextPlayerName() {
  const { currentPlayer, gameDirection } = gameState;
  const currentIndex = PLAYER_ORDER.indexOf(currentPlayer);
  return PLAYER_ORDER[(currentIndex + gameDirection + 4) % 4];
}

export function forceDrawCards(playerName, count) {
  const { deck, players } = gameState;
  for (let i = 0; i < count; i++) {
    if (deck.length > 0) players[playerName].push(deck.pop());
  }

  if (playerName === "player") {
    UI.renderPlayerHand();
  } else {
    UI.renderOpponentHands();
  }
}

export function nextTurn(steps = 1) {
  // Stop everything if the game is over
  if (gameState.isGameOver) return;

  let idx = PLAYER_ORDER.indexOf(gameState.currentPlayer);
  idx = (idx + steps * gameState.gameDirection + 4) % 4;
  gameState.currentPlayer = PLAYER_ORDER[idx];

  UI.updateTurnVisuals();
  UI.updateNotification();

  if (gameState.currentPlayer !== "player") {
    // Clear any existing timeouts to be safe
    setTimeout(opponentPlay, 1200);
  }
}

export function applyCardEffect(card) {
  const effect = Rules.getCardEffect(card);

  if (effect) {
    if (effect.type === "reverse") {
      gameState.gameDirection *= -1;
      UI.updateNotification(effect.message);
      nextTurn(1);
    } else if (effect.type === "skip") {
      UI.updateNotification(effect.message);
      nextTurn(2);
    } else if (effect.type === "draw") {
      const nextPlayer = getNextPlayerName();
      forceDrawCards(nextPlayer, effect.amount);
      UI.updateNotification(effect.message);
      nextTurn(2);
    }
  } else {
    nextTurn(1);
  }
}

export function opponentPlay() {
  if (gameState.isGameOver) return;

  const { currentPlayer, players, discardPile, deck } = gameState;
  const hand = players[currentPlayer];
  const playableCards = hand.filter((card) => isCardPlayable(card));

  if (playableCards.length > 0) {
    const cardToPlay = playableCards[Math.floor(Math.random() * playableCards.length)];
    const cardIndex = hand.indexOf(cardToPlay);

    hand.splice(cardIndex, 1);
    discardPile.push(cardToPlay);

    if (cardToPlay.color === "wild" || cardToPlay.value === "wild-draw4") {
      cardToPlay.color = Rules.getBestColor(hand);
    }

    UI.renderOpponentHands();
    UI.renderDiscardPile();

    if (hand.length === 0) {
      gameState.isGameOver = true;
      UI.showWinScreen(currentPlayer);
      return;
    }

    applyCardEffect(cardToPlay);

  } else {
    if (deck.length > 0) {
      hand.push(deck.pop());
      UI.renderOpponentHands();
    }
    nextTurn(1);
  }
}
