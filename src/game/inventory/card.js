'use strict';

export default class Card {
  constructor(name, value, suit, rank) {
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
