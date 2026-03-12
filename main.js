// main.js - The Controller
import { updateActivePlayerUI, initClickHandlers } from './modules/userInterface.js';

// 1. Define the available cards
const cardTypes = [
    'purple1', 'purple2', 'purple3', 'purple4', 'purple5', 
    'purple6', 'purple7', 'purple8', 'purple9', 
    'purpleplus4', 'purplereverse', 'purpleskip'
];

// 2. Create and shuffle the deck
function createDeck() {
    let deck = [];
    cardTypes.forEach(type => {
        deck.push({ type: type, image: `assets/${type}.png` });
        deck.push({ type: type, image: `assets/${type}.png` });
    });
    return deck.sort(() => Math.random() - 0.5);
}

// 3. Helper to render cards to the screen
function renderHand(containerId, hand) {
    const container = document.querySelector(containerId);
    container.innerHTML = ''; 
    hand.forEach(card => {
        const img = document.createElement('img');
        img.src = card.image;
        img.classList.add('card');
        container.appendChild(img);
    });
}

async function startGame() {
    console.log("Game Engine Primed.");
    
    // --- INITIALIZATION PHASE ---
    const deck = createDeck();
    let playerHand = [];
    let opponentHand = [];

    // Deal 7 cards each
    for (let i = 0; i < 7; i++) {
        playerHand.push(deck.pop());
        opponentHand.push(deck.pop());
    }

    renderHand('#player-hand', playerHand);
    // ----------------------------

    initClickHandlers();

    let activePlayerIndex = 0; 
    let isGameOver = false;

    // The Infinite Game Loop
    while (!isGameOver) {
        updateActivePlayerUI(activePlayerIndex);

        if (activePlayerIndex === 0) {
            await waitForHumanMove();
        } else {
            await sleep(2000); 
        }

        activePlayerIndex = (activePlayerIndex === 0) ? 1 : 0;
        await sleep(500);
    }
}

function waitForHumanMove() {
    return new Promise((resolve) => {
        window.addEventListener('humanMoveComplete', (e) => {
            resolve(e.detail);
        }, { once: true });
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

startGame();
