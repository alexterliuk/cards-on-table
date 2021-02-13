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

  // ================== interacting with ownCards ==================
  // these methods are called rather by other methods than directly

  addCardToOwnCards(card: Card | null, idx?: number): boolean {
    if (card instanceof Card) {
      if (!this.ownCards.includes(card)) {
        // add to given index or to end
        this.ownCards.splice(idx || this.ownCards.length, 0, card);
        return true;
      }
    }
    return false;
  }

  // returns index at which card was before removal, or -1
  removeCardFromOwnCards(card: Card): number {
    const idx = this.ownCards.findIndex(c => c === card);
    if (idx < 0) return -1;
    this.ownCards = this.ownCards.filter(c => c !== card);
    return idx;
  }

  takeRandomCardFromOwnCards(): { card: Card | null; idx: number } {
    const idx = getRandomFloor(0, this.ownCards.length);
    return !this.ownCards.length
      ? { card: null, idx: -1 }
      : { card: this.ownCards.splice(idx, 1)[0], idx };
  }

  // ==================== interacting with deck ====================

  shuffleDeck(): Card[] {
    return this.deck.shuffle();
  }

  shuffleDeckManyTimes(max = 100): Card[] {
    return this.deck.shuffleManyTimes(max);
  }

  returnObtainedCardBackToDeck(card: Card | null) {
    // as card was taken from start, return it also to start
    const returnedToDeck = this.deck.returnCardToDeck(card, null, 'toStart');
    if (!returnedToDeck) {
      throw new Error(
        'Card was taken from deck, player rejected it, and card failed to return back to deck.'
      );
    }
    return true;
  }

  returnOwnCardBackToOwnCards(card: Card, cardIdx?: number) {
    const returnedToOwnCards = this.addCardToOwnCards(card, cardIdx);
    if (!returnedToOwnCards) {
      throw new Error(
        'Card was taken from player, deck rejected it, and card failed to return back to player.'
      );
    }
    return true;
  }

  // used when player tries to get first card from deck, so eventually they either get card, or null
  addCardToOwnCardsOrReturnBackToDeck(card: Card | null): Card | null {
    return this.addCardToOwnCards(card)
      ? card
      : (this.returnObtainedCardBackToDeck(card), null);
  }

  // used when player tries to return own card to deck, so if deck takes it back the player gets true,
  // but if deck fails to do it, the card is returned to ownCards - and the card is returned from this function
  // with the meaning 'card rejected by deck'
  returnCardToDeckOrReturnBackToOwnCards(
    card: Card,
    cardIdx: number
  ): true | Card {
    return this.deck.returnCardToDeck(card)
      ? true
      : (this.returnOwnCardBackToOwnCards(card, cardIdx), card);
  }

  takeCardFromDeck(): Card | null {
    const card = this.deck.takeCardFromAllCards();
    return this.addCardToOwnCardsOrReturnBackToDeck(card);
  }

  takeRandomCardFromDeck(): Card | null {
    const card = this.deck.takeRandomCardFromAllCards();
    return this.addCardToOwnCardsOrReturnBackToDeck(card);
  }

  // if failed to return to deck, it returns to ownCards to same index the card was taken from
  // prettier-ignore
  returnOwnCardToDeck(card: Card): boolean {
    const cardIdx = this.removeCardFromOwnCards(card);
    // card was not found, so no removal performed
    if (cardIdx === -1) return false;

    const cardInDeckOrCard = this.returnCardToDeckOrReturnBackToOwnCards(card, cardIdx);
    return cardInDeckOrCard instanceof Card
      ? false // card returned to ownCards
      : true; // card returned to deck
  }

  // if failed to return to deck, it returns to ownCards to same index the card was taken from
  // prettier-ignore
  returnRandomOwnCardToDeck(): boolean {
    const { card, idx } = this.takeRandomCardFromOwnCards();
    if (card) {
      const cardInDeckOrCard = this.returnCardToDeckOrReturnBackToOwnCards(card, idx);
      return cardInDeckOrCard instanceof Card
        ? false // card returned to ownCards
        : true; // card returned to deck
    }
    return false;
  }

  returnAllOwnCardsToDeck(): boolean {
    let maxIterations = this.deck.length;
    while (this.ownCards.length) {
      const card = this.ownCards[this.ownCards.length - 1];
      this.returnOwnCardToDeck(card);
      if (!--maxIterations) break;
    }
    return !this.ownCards.length;
  }

  assignTrumpSuit(suitName: string) {
    this.deck.assignTrumpSuit(suitName);
  }

  clearTrumpSuit() {
    this.deck.clearTrumpSuit();
  }

  openTrumpCard() {
    this.deck.openTrumpCard();
  }

  closeTrumpCard() {
    this.deck.closeTrumpCard();
  }

  closeTrumpCardAndHide() {
    this.deck.closeTrumpCardAndHide();
  }
}
