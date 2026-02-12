/**
 * Uno Game Card Logic
 */

class UnoCard {
  constructor(color, value) {
    this.color = color; 
    this.value = value; 
  }

  isPlayable(topCard) {
    return (
      this.color === 'Wild' || 
      this.color === topCard.color || 
      this.value === topCard.value
    );
  }

  
  play(game) {
    console.log(`Played: ${this.color} ${this.value}`);
    this.action(game);
  }

  // Standard cards method
  action(game) {
    // Standard number cards will just end the turn logic
  }
}


class UniqueCard extends UnoCard {
  constructor(color, value) {
    super(color, value);
  }
}


class SpecialCard extends UnoCard {
  constructor(color, value) {
    super(color, value);
  }

  action(game) {
    switch (this.value) {
      case 'Skip':
        game.skipNextPlayer();
        break;
      case 'Reverse':
        game.reverseTurnOrder();
        break;
      case '+2':
        game.playerDraws(game.getNextPlayer(), 2);
        game.skipNextPlayer();
        break;
    }
  }
}

class WildCard extends SpecialCard {
  constructor(value) {
    super('Wild', value);
    this.chosenColor = null;
  }

  isPlayable(topCard) {
    return true;
  }

  action(game) {
    if (this.value === '+4') {
      game.playerDraws(game.getNextPlayer(), 4);
      game.skipNextPlayer();
    }
  }
}

class CustomCard extends SpecialCard {
  constructor(name, description, effectCallback) {
    super('Custom', name);
    this.description = description;
    this.effectCallback = effectCallback;
  }

  isPlayable(topCard) {
    return true; 
  }

  action(game) {
    console.log(`Executing Custom Ability: ${this.value}`);
    if (this.effectCallback) {
      this.effectCallback(game);
    }
  }
}

// export { UnoCard, UniqueCard, SpecialCard, WildCard, CustomCard };