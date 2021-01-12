'use strict';

import Card from './card';

export default class Suit {
  constructor(name, cardsData) {
    this.name = name;
    this.cards = cardsData.map(cd => new Card(cd[0], cd[1], name, cd[2]));
  }
}
