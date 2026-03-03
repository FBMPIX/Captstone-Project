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

        switch(card.value) {

            case "Skip":
                return {
                    type: "skip",
                    message: "Next player skipped!"
                };

            case "Reverse":
                return {
                    type: "reverse",
                    message: "Game direction reversed!"
                };

            case "+8":
                return {
                    type: "draw",
                    amount: 8,
                    message: "Next player draws 8 cards!"
                };

            case "+4":
                return {
                    type: "draw",
                    amount: 4,
                    message: "Next player draws 4 cards!"
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
                message: "UNO not called! Draw 2 cards."
            };
        }

        return {
            penalty: false
        };
    },


    // ==========================
    // Verify player owns card
    // ==========================
    verifyOwnership(player, card) {

        return player.hand.some(c =>
            c.color === card.color && c.value === card.value
        );
    }
};
