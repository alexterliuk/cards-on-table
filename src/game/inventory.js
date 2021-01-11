'use strict';

import shuffleArrayOfUniqueValues from '../lib/shuffle-array-of-unique-values';

class Card {
  constructor(name, value, suit, rank) {
    this.name = name;
    this.value = value;
    this.suit = suit;
    this.rank = rank;
    this.shown = false;
  }
}

class Suit {
  constructor(name, cardsData) {
    this.name = name;
    this.cards = cardsData.map(cd => new Card(cd[0], cd[1], name, cd[2]));
  }
}

export class Deck {
  constructor(suitNames, singleSuitData) {
    this.suitNames = suitNames;
    void this.suitNames.forEach(n => (this[n] = new Suit(n, singleSuitData)));
    this.allCards = this.suitNames.reduce(
      (acc, n) => [...acc, ...this[n].cards],
      []
    );
  }

  shuffle() {
    this.allCards = shuffleArrayOfUniqueValues(this.allCards);
    return this.allCards;
  }
}
