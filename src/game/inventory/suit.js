import Card from './card.js';
import { isString } from '../../lib/utils/value-checkers.js';

export default class Suit {
  /**
   * @param {string} name
   * @param {array} cardsData - of arrays with cards params ([name, value, rank])
   *    e.g. for suit with only 2 cards: [['king', 4, 2], ['queen', 3, 1]]
   */
  constructor(name, cardsData) {
    if (!isString(name)) {
      throw new Error('name must be string when creating new Suit.');
    }

    this.name = name;
    this.cards = cardsData.map(cd => new Card(cd[0], cd[1], name, cd[2]));
  }
}
