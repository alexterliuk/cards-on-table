import Card from './card';
import Suit from './suit';
import { DeckCardsData, SuitCardsData } from '../data/deck-cards-data';
import shuffleArrayOfUniqueValues from '../../lib/shuffle-array-of-unique-values';
import {
  isNumber,
  getPositiveIntegerOrZero,
} from '../../lib/utils/value-checkers';
import getRandomFloor from '../../lib/utils/get-random-floor';
import areValidValsByInstance from '../../lib/utils/are-valid-vals-by-instance';

interface Suits {
  [x: string]: { name: string; cards: Card[] };
}

class DeckConstructor {
  suitNames: string[] = [];
  suits: Suits = {};
  allCards: Card[] = [];
  trumpSuitName = '';
  openedTrumpCard: Card | null = null;
  shuffledLastTime = 0;
  takenCards: Card[] = [];
  trumpSuitCardsData: SuitCardsData = [];
  protected constructDeck: (deckCardsData: DeckCardsData) => void;
  protected constructor() {
    this.constructDeck = deckCardsData => {
      [this.suitNames, this.suits, this.allCards] = !deckCardsData
        ? [[], {}, []]
        : deckCardsData.suitsData.reduce(
            (acc: [string[], Suits, Card[]], suitData) => {
              acc[0].push(suitData.name);
              acc[1][suitData.name] = new Suit(suitData);
              acc[2] = [...acc[2], ...acc[1][suitData.name].cards];
              return acc;
            },
            [[], {}, []]
          );

      this.trumpSuitName = '';
      this.openedTrumpCard = null;
      this.shuffledLastTime = 0;
      this.takenCards = [];
      //this.trumpSuitCardsData = [];
    };
  }
}

export default class Deck extends DeckConstructor {
  resetState;

  constructor(deckCardsData: DeckCardsData) {
    super();
    this.constructDeck(deckCardsData);
    this.resetState = (() => {
      const _deckCardsData = {
        suitsData: deckCardsData?.suitsData.map(sd => ({
          name: sd.name,
          cardsData: sd.cardsData.map(cd => [...cd]),
        })),
        trumpSuitCardsData:
          deckCardsData?.trumpSuitCardsData.map(cd => [...cd]) || [],
      };
      // TODO: make possible making id for each card
      return () => {
        // _deckCardsData might not have all needed contents (e.g. suits, cards are empty)
        // if a user creates a template deck (new Deck() -> deck with empty data);
        // tell TS that it is allowed by 'as DeckCardsData'
        this.constructDeck(_deckCardsData as DeckCardsData);
      };
    })();
  }

  shuffle(): Card[] {
    this.allCards = shuffleArrayOfUniqueValues(this.allCards);
    this.shuffledLastTime = 1;
    return this.allCards;
  }

  shuffleManyTimes(max = 100): Card[] {
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
   */
  takeCardFromAllCards(): Card | null {
    if (!this.allCards.length) return null;

    this.takenCards.unshift(this.allCards.splice(0, 1)[0]);
    return this.takenCards[0];
  }

  takeRandomCardFromAllCards(): Card | null {
    if (!this.allCards.length) return null;

    const idx = getRandomFloor(0, this.allCards.length);
    this.takenCards.unshift(this.allCards.splice(idx, 1)[0]);
    return this.takenCards[0];
  }

  /**
   * @param card
   * @param [idxInTakenCards] - idx where the card is located in takenCards
   * @returns boolean - success or not
   */
  returnCardToDeck(card: Card, idxInTakenCards?: number): boolean {
    if (!(card instanceof Card)) return false;

    const foundCard =
      (isNumber(idxInTakenCards) &&
        this.takenCards.splice(idxInTakenCards as number, 1)[0]) ||
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

  returnRandomCardToDeck(): Card | false {
    if (!this.takenCards.length) return false;

    const idx = getRandomFloor(0, this.takenCards.length);
    const card = this.takenCards[idx];
    const returnedToDeck = this.returnCardToDeck(card, idx);
    return returnedToDeck ? card : false;
  }

  returnAllCardsToDeck(): boolean {
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
      if (card) {
        card.close();
        this.allCards.push(card);
      }
    }

    return !this.takenCards.length && !!this.allCards.length;
  }

  makeTrumpSuit(suit: Suit) {
    if (!(suit instanceof Suit)) return false;
    this.trumpSuitName = suit.name;
    return true;
  }

  resetTrumpSuit() {
    this.trumpSuitName = '';
  }

  openTrumpCard() {
    this.openedTrumpCard = this.takeRandomCardFromAllCards();
    this.openedTrumpCard?.open();
  }

  closeTrumpCard() {
    this.openedTrumpCard?.close();
    return true;
  }

  closeTrumpCardAndHide() {
    const closed = this.closeTrumpCard();
    if (closed) {
      this.openedTrumpCard = null;
    }
  }

  /**
   * @param playersQty
   * @param cardsQtyToPlayer
   * @param [buyInCardsQty]
   * @param [openTrumpCard]
   * @returns array of arrays of two arrays for every player
   *          e.g. 3 players in the game:
   *               [
   *                 [[given cards], [buy-in cards]],
   *                 [[given cards], [buy-in cards]],
   *                 [[given cards], [buy-in cards]],
   *               ]
   */
  // TODO: these all params should be moved to game rules (to Deck's constructor)
  deal(
    playersQty: number,
    cardsQtyToPlayer: number,
    buyInCardsQty?: number,
    openTrumpCard?: boolean
  ): Card[][][] {
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

    const dealt: Card[][] = Array(playersQty)
      .fill(1)
      .map(() => []);
    const dealtBuyIn: Card[][] = Array(playersQty)
      .fill(1)
      .map(() => []);

    this.shuffleManyTimes();

    dealCards(dealt, cardsQtyToPlayer, this);

    if (openTrumpCard) {
      this.openTrumpCard();
    }

    if (buyInCardsQty) {
      dealCards(dealtBuyIn, buyInCardsQty, this);
    }

    return dealt.map((d, i) => [d, dealtBuyIn[i]]);

    function dealCards(arr: Card[][], qty: number, thisArg: Deck) {
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