import Card from './card.js';
import Suit from './suit.js';
import shuffleArrayOfUniqueValues from '../../lib/shuffle-array-of-unique-values.js';
import {
  isArray,
  isNumber,
  getPositiveIntegerOrZero,
} from '../../lib/utils/value-checkers.js';
import getRandomFloor from '../../lib/utils/get-random-floor.js';
import areValidValsByInstance from '../../lib/utils/are-valid-vals-by-instance.js';

class DeckConstructor {
  constructor() {
    this.constructDeck = (thisArg, suitNames, singleSuitData) => {
      thisArg.suitNames = suitNames;
      thisArg.trumpSuitName = '';
      thisArg.openedTrumpCard = null;
      thisArg.shuffledLastTime = 0;
      // create suits
      thisArg.suitNames.forEach(
        n => (thisArg[n] = new Suit(n, singleSuitData))
      );
      thisArg.allCards = thisArg.suitNames.reduce(
        (acc, n) => [...acc, ...thisArg[n].cards],
        []
      );
      thisArg.takenCards = [];
    };
  }
}

export default class Deck extends DeckConstructor {
  constructor(suitNames, singleSuitData) {
    super();
    if (!isArray(suitNames)) suitNames = [];
    if (!isArray(singleSuitData)) singleSuitData = [];

    this.constructDeck(this, suitNames, singleSuitData);

    this.resetState = (() => {
      const _suitNames = [...suitNames];
      const _singleSuitData = [...singleSuitData];
      // TODO: make possible making id for each card
      return () => {
        this.constructDeck(this, _suitNames, _singleSuitData);
      };
    })();
  }

  /**
   * @returns {array} - with Cards
   */
  shuffle() {
    this.allCards = shuffleArrayOfUniqueValues(this.allCards);
    this.shuffledLastTime = 1;
    return this.allCards;
  }

  /**
   * @returns {array} - with Cards
   */
  shuffleManyTimes(max = 100) {
    let qty = getRandomFloor(2, getPositiveIntegerOrZero(max));
    const shuffledQty = qty;
    while (qty--) {
      this.shuffle();
    }
    this.shuffledLastTime = shuffledQty;
    return this.allCards;
  }

  /**
   * It is usually used for:
   * - dealing
   * - selecting who deals first in the game
   *   (by taking cards one by one until chosen one is found)
   * @returns {Card}
   */
  takeCardFromAllCards() {
    if (!this.allCards.length) return;

    this.takenCards.unshift(this.allCards.splice(0, 1)[0]);
    return this.takenCards[0];
  }

  /**
   * @returns {Card}
   */
  takeRandomCardFromAllCards() {
    if (!this.allCards.length) return;

    const idx = getRandomFloor(0, this.allCards.length);
    this.takenCards.unshift(this.allCards.splice(idx, 1)[0]);
    return this.takenCards[0];
  }

  /**
   * @param {number} [idxInTakenCards] - idx where the card is located in takenCards
   * @returns {boolean} - success or not
   */
  returnCardToDeck(card, idxInTakenCards) {
    if (!(card instanceof Card)) return false;

    let foundCard =
      (isNumber(idxInTakenCards) &&
        this.takenCards.splice(idxInTakenCards, 1)[0]) ||
      this.takenCards.find((c, i) => {
        if (c === card) {
          return this.takenCards.splice(i, 1);
        }
      });

    if (foundCard) {
      foundCard.close();
      this.allCards.push(foundCard);

      if (foundCard === this.openedTrumpCard) {
        this.closeTrumpCardAndHide();
      }
    }

    return !!foundCard;
  }

  /**
   * @returns {Card|false}
   */
  returnRandomCardToDeck() {
    if (!this.takenCards.length) return false;

    const idx = getRandomFloor(0, this.takenCards.length);
    const card = this.takenCards[idx];
    const returnedToDeck = this.returnCardToDeck(card, idx);
    return returnedToDeck ? card : false;
  }

  /**
   * @returns {boolean} - success or not
   */
  returnAllCardsToDeck() {
    const allCardsValid = areValidValsByInstance(this.allCards, Card, true);
    const takenCardsValid = areValidValsByInstance(this.takenCards, Card, true);
    const allValid = allCardsValid && takenCardsValid;

    if (!allValid) {
      throw new Error(
        'The deck is compromised - some card is not a Card. Create new Deck.'
      );
    }

    this.closeTrumpCardAndHide();
    this.trumpSuitName = '';

    while (this.takenCards.length) {
      const card = this.takenCards.pop();
      card.close();
      this.allCards.push(card);
    }

    return !this.takenCards.length && !!this.allCards.length;
  }

  makeTrumpSuit(suit) {
    if (!(suit instanceof Suit)) return false;
    this.trumpSuitName = suit.name;
    return true;
  }

  resetTrumpSuit() {
    this.trumpSuitName = '';
  }

  openTrumpCard() {
    this.openedTrumpCard = this.takeRandomCardFromAllCards();
    this.openedTrumpCard.open();
  }

  closeTrumpCard() {
    if (this.openedTrumpCard instanceof Card) {
      this.openedTrumpCard.close();
      return true;
    }
  }

  closeTrumpCardAndHide() {
    const closed = this.closeTrumpCard();
    if (closed) {
      this.openedTrumpCard = null;
    }
  }

  /**
   * @param {number} playersQty
   * @param {number} cardsQtyToPlayer
   * @param {number} [buyInCardsQty]
   * @param {boolean} [openTrumpCard]
   * @returns {array} - of arrays of two arrays for every player
   *                    e.g. 3 players in the game:
   *                         [
   *                           [[given cards], [buy-in cards]],
   *                           [[given cards], [buy-in cards]],
   *                           [[given cards], [buy-in cards]],
   *                         ]
   */
  // TODO: these all params should be moved to game rules (to Deck's constructor)
  deal(playersQty, cardsQtyToPlayer, buyInCardsQty, openTrumpCard) {
    this.returnAllCardsToDeck();
    const [plQ, caQ, buQ] = [
      getPositiveIntegerOrZero(playersQty),
      getPositiveIntegerOrZero(cardsQtyToPlayer),
      getPositiveIntegerOrZero(buyInCardsQty),
    ];

    if (!plQ || !caQ) {
      throw new Error(
        "playersQty, cardsQtyToPlayer aren't numbers or one/both of them is 0."
      );
    }
    if (typeof buyInCardsQty !== 'undefined' && !buQ) {
      throw new Error('buyInCardsQty must be number or undefined.');
    }
    if (
      playersQty * (cardsQtyToPlayer + (buyInCardsQty || 0)) >
      this.allCards.length
    ) {
      throw new Error(
        `Not enough cards to deal (${
          plQ > 1 ? 'too many players' : 'one player wants impossible'
        }).`
      );
    }

    const dealt = Array(playersQty)
      .fill(1)
      .map(_ => []);
    const dealtBuyIn = Array(playersQty)
      .fill(1)
      .map(_ => []);

    this.shuffleManyTimes();

    dealCards(dealt, cardsQtyToPlayer, this);

    if (openTrumpCard) {
      this.openTrumpCard();
    }

    if (buyInCardsQty) {
      dealCards(dealtBuyIn, buyInCardsQty, this);
    }

    return dealt.map((d, i) => [d, dealtBuyIn[i]]);

    function dealCards(arr, qty, thisArg) {
      let given = 0;
      while (given !== qty) {
        arr.forEach(set => {
          const card = thisArg.takeCardFromAllCards();
          if (card) set.push(card);
        });
        given++;
      }
    }
  }
}
