import Deck from '../inventory/deck';
import Card from '../inventory/card';
import getRandomFloor from '../lib/utils/get-random-floor';

export default class Player {
  deck: Deck;
  ownCards: Card[];
  combinations: { name: string; cards: Card[] }[];
  fines: { name: string; value: number }[];
  bonuses: { name: string; value: number }[];

  constructor(deck: Deck) {
    if (!(deck instanceof Deck)) {
      throw new Error(
        'deck must be instance of Deck when creating new Player.'
      );
    }
    this.deck = deck;
    this.ownCards = [];
    this.combinations = [];
    this.fines = [];
    this.bonuses = [];
  }

  addCardToOwnCards(card: Card | null): boolean {
    if (card instanceof Card) {
      if (!this.ownCards.includes(card)) {
        this.ownCards.push(card);
        return true;
      }
    }
    return false;
  }

  removeCardFromOwnCards(card: Card): boolean {
    if (this.ownCards.includes(card)) {
      this.ownCards = this.ownCards.filter(c => c !== card);
      return true;
    }
    return false;
  }

  takeRandomCardFromOwnCards(): Card | null {
    if (!this.ownCards.length) return null;
    const idx = getRandomFloor(0, this.ownCards.length);
    return this.ownCards.splice(idx, 1)[0];
  }
}
