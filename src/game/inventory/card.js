import { areStrings, areNumbers } from '../../lib/utils/value-checkers.js';

export default class Card {
  /**
   * @param {string} name
   * @param {number} value
   * @param {string} suit
   * @param {number} rank
   */
  constructor(name, value, suit, rank) {
    if (!areStrings(name, suit) || !areNumbers(value, rank)) {
      throw new Error(
        'Invalid param passed when creating new card: name, suit must be strings; value, rank must be numbers.'
      );
    }

    this.name = name;
    this.value = value;
    this.suit = suit;
    this.rank = rank;
    this.opened = false;
  }

  open() {
    this.opened = true;
  }

  close() {
    this.opened = false;
  }
}
