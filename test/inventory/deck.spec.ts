import { strictEqual as equal, throws, doesNotThrow } from 'assert';
import {
  isArray,
  isFunction,
  isObject,
  isNull,
} from '../../src/lib/utils/value-checkers';
import getRandomElementFromArray from '../../src/lib/utils/get-random-element-from-array';
import Card, { cardKeys, CardValues } from '../../src/inventory/card';
import { SuitValues } from '../../src/inventory/suit';
import Deck from '../../src/inventory/deck';
import deckCardsData from '../../src/data/deck-cards-data';

const isValidDeck = (
  deck: Deck,
  suitNamesLength = 0,
  allCardsLength = 0,
  takenCardsLength = 0
) => {
  // prettier-ignore
  const result = [
    ['suitNamesLength', isArray(deck.suitNames) && deck.suitNames.length === suitNamesLength],
    ['suitsKeysLength', Object.keys(deck.suits).length === suitNamesLength],
    ['allCards', isArray(deck.allCards) && deck.allCards.length === allCardsLength],
    ['trumpSuitName', deck.trumpSuitName === ''],
    ['openedTrumpCard', isNull(deck.openedTrumpCard)],
    ['shuffledLastTime', deck.shuffledLastTime === 0],
    ['takenCards', isArray(deck.takenCards) && deck.takenCards.length === takenCardsLength],
    ['trumpSuitCardsData', isArray(deck.trumpSuitCardsData)],
    // @ts-expect-error: constructDeck is protected and should not be accessed, ignore for testing
    ['constructDeck', isFunction(deck.constructDeck)],
    ['resetState', isFunction(deck.resetState)],
  ];

  // @ts-expect-error: array.some implementation with reduce (complains due to unusual usage of reduce)
  const name = result.reduce((acc: string, v: [string, boolean][]) => {
    if (v[1]) return acc;
    result.length = 0;
    return v[0];
  }, '');

  return name ? `[isValidDeck err]: ${name} is invalid` : true;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const isInstanceOf = (name: string, v: any) =>
  Object.getPrototypeOf(v).constructor.name === name;
const isCard = (c: any) => isInstanceOf('Card', c);
const isSuit = (s: any) => isInstanceOf('Suit', s);
/* eslint-enable @typescript-eslint/no-explicit-any */

describe(`Deck`, () => {
  describe(`new Deck()`, () => {
    it(`creates a template deck with empty data`, () => {
      // @ts-expect-error: expected 1 argument
      const deck = new Deck();
      equal(isValidDeck(deck), true);
    });
  });

  describe(`new Deck(<data for one card>)`, () => {
    it(`creates a deck with only one suit comprising only one card`, () => {
      const deck = new Deck({
        suitsData: [{ name: 'hearts', cardsData: [['king', 10, 1]] }],
        trumpSuitCardsData: [['king', 100, 10]],
      });
      equal(isValidDeck(deck, 1, 1, 0), true);
      equal(deck.suitNames[0], 'hearts');
      equal(Object.prototype.hasOwnProperty.call(deck.suits, 'hearts'), true);
      equal(isSuit(deck.suits.hearts), true);
      equal(isCard(deck.allCards[0]), true);
    });
  });

  describe(`new Deck(deckCardsData)`, () => {
    // prettier-ignore
    it(`creates a deck with 4 suits and 52 cards overall`, () => {
      const deck = new Deck(deckCardsData);
      equal(isValidDeck(deck, 4, 52, 0), true);
      const suitsData = deckCardsData.suitsData;
      equal(suitsData.every(sd => deck.suitNames.includes(sd.name)), true);
      equal(suitsData.every(sd => Object.prototype.hasOwnProperty.call(deck.suits, sd.name)), true);
      equal(suitsData.every(sd => isSuit(deck.suits[sd.name])), true);
      equal(deck.allCards.every(c => isCard(c)), true);
    });
  });

  describe(`deck shuffles cards`, () => {
    const deck = new Deck(deckCardsData);
    const cardsInOrigOrder = [...deck.allCards];
    const isShuffled = (cardsBefore: Card[]) =>
      cardsBefore.some((c, i) => c !== deck.allCards[i]);

    it(`shuffles one time`, () => {
      deck.shuffle();
      equal(isShuffled(cardsInOrigOrder), true);
      equal(deck.shuffledLastTime === 1, true);
    });

    it(`shuffles many times`, () => {
      deck.shuffleManyTimes();
      equal(isShuffled(cardsInOrigOrder), true);
      equal(deck.shuffledLastTime > 1, true);
    });
  });

  describe(`deck takes a card from all cards stack`, () => {
    it(`[takeCardFromAllCards] takes first card`, () => {
      const deck = new Deck(deckCardsData);
      const firstCardInAllCards = deck.allCards[0];
      const firstCardInTakenCards = deck.takenCards[0];
      const allCardsLength = deck.allCards.length;
      const takenCardsLength = deck.takenCards.length;
      const card = deck.takeCardFromAllCards();

      equal(firstCardInAllCards !== deck.allCards[0], true);
      equal(firstCardInTakenCards !== deck.takenCards[0], true);
      equal(card === deck.takenCards[0], true);
      equal(deck.allCards.length === allCardsLength - 1, true);
      equal(deck.takenCards.length === takenCardsLength + 1, true);
    });

    it(`[takeCardFromAllCards] takes random card`, () => {
      const deck = new Deck(deckCardsData);
      // omit test in case if deckCardsData in future will have data for just a few cards
      if (deck.allCards.length > 5) {
        const card1 = deck.allCards[0];
        const takenCard1 = deck.takeRandomCardFromAllCards();
        const passed1 = card1 !== takenCard1;

        const card2 = deck.allCards[0];
        const takenCard2 = deck.takeRandomCardFromAllCards();
        const passed2 = card2 !== takenCard2;

        const card3 = deck.allCards[0];
        const takenCard3 = deck.takeRandomCardFromAllCards();
        const passed3 = card3 !== takenCard3;

        equal([passed1, passed2, passed3].includes(true), true);
      }
    });
  });

  describe(`deck returns a card to all cards stack`, () => {
    it(`[returnCardToDeck] does nothing and returns false if 1st arg is not card`, () => {
      const deck = new Deck(deckCardsData);
      const origAllCards = deck.allCards.map(c => c);
      equal(deck.takenCards.length, 0);
      // @ts-expect-error: expected 1-2 arguments
      const result = deck.returnCardToDeck();
      equal(result, false);
      equal(
        origAllCards.every((c, i) => c === deck.allCards[i]),
        true
      );
      equal(deck.takenCards.length, 0);
    });

    it(`[returnCardToDeck] takes card back to all cards (to end), closes card and returns true`, () => {
      const deck = new Deck(deckCardsData);
      const allCardsLength = deck.allCards.length;
      const card = deck.takeCardFromAllCards();
      equal(allCardsLength !== deck.allCards.length, true);
      equal(!!card, true);

      // recheck card's existence for TS to get rid of 'card is possibly null' error
      if (card) {
        card.open();
        equal(card.opened, true);

        const result = deck.returnCardToDeck(card);

        equal(allCardsLength === deck.allCards.length, true);
        equal(deck.allCards[deck.allCards.length - 1], card); // card added to end
        equal(card.opened, false);
        equal(result, true);
      }
    });

    it(`[returnCardToDeck] takes card back to all cards (to start), closes card and returns true`, () => {
      const deck = new Deck(deckCardsData);
      const allCardsLength = deck.allCards.length;
      const card = deck.takeCardFromAllCards();
      equal(allCardsLength !== deck.allCards.length, true);
      equal(!!card, true);

      // recheck card's existence for TS to get rid of 'card is possibly null' error
      if (card) {
        card.open();
        equal(card.opened, true);

        const result = deck.returnCardToDeck(card, null, 'toStart');

        equal(allCardsLength === deck.allCards.length, true);
        equal(deck.allCards[0], card); // card added to start
        equal(card.opened, false);
        equal(result, true);
      }
    });

    it(`[returnRandomCardToDeck] takes random card back to all cards, closes card and returns true`, () => {
      const deck = new Deck(deckCardsData);
      // omit test in case if deckCardsData in future will have data for just a few cards
      if (deck.allCards.length > 5) {
        const allCardsLength = deck.allCards.length;
        const card1 = deck.takeCardFromAllCards();
        const card2 = deck.takeCardFromAllCards();
        const card3 = deck.takeCardFromAllCards();
        const card4 = deck.takeCardFromAllCards();
        const card5 = deck.takeCardFromAllCards();

        equal(allCardsLength === deck.allCards.length + 5, true);
        equal(deck.takenCards.length === 5, true);
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        card1!.open();
        card2!.open();
        card3!.open();
        card4!.open();
        card5!.open();
        /* eslint-enable @typescript-eslint/no-non-null-assertion */

        const isTakenNotFirst = () =>
          deck.takenCards[0] !== deck.allCards[deck.allCards.length - 1];
        const res1 = deck.returnRandomCardToDeck();
        const takenNotFirst1 = isTakenNotFirst();
        const res2 = deck.returnRandomCardToDeck();
        const takenNotFirst2 = isTakenNotFirst();
        const res3 = deck.returnRandomCardToDeck();
        const takenNotFirst3 = isTakenNotFirst();

        // prettier-ignore
        equal([res1, res2, res3].every(r => r), true);
        // prettier-ignore
        equal([takenNotFirst1, takenNotFirst2, takenNotFirst3].includes(true), true);
        equal(deck.allCards.slice(-3).filter(c => c.opened).length, 0);
        equal(allCardsLength === deck.allCards.length + 2, true);
        equal(deck.takenCards.length === 2, true);
      }
    });
  });

  describe(`deck returns all cards to all cards stack`, () => {
    it(`[returnAllCardsToDeck] throws if allCards or takenCards have smth which is not card`, () => {
      let deck = new Deck(deckCardsData);
      /* eslint-disable @typescript-eslint/ban-ts-comment */
      // @ts-expect-error
      deck.allCards.push({});
      throws(() => deck.returnAllCardsToDeck());

      deck = new Deck(deckCardsData);
      // @ts-expect-error
      deck.takenCards.push('');
      throws(() => deck.returnAllCardsToDeck());

      deck = new Deck(deckCardsData);
      deck.takeCardFromAllCards();
      // @ts-expect-error
      deck.allCards.push(0);
      throws(() => deck.returnAllCardsToDeck());

      deck = new Deck(deckCardsData);
      deck.takeCardFromAllCards();
      deck.takeCardFromAllCards();
      deck.takeCardFromAllCards();
      // @ts-expect-error
      deck.takenCards.push(true);
      throws(() => deck.returnAllCardsToDeck());
      /* eslint-enable @typescript-eslint/ban-ts-comment */
    });

    it(`[returnAllCardsToDeck] makes trumpSuitName empty string`, () => {
      const deck = new Deck(deckCardsData);
      equal(deck.trumpSuitName, '');
      deck.trumpSuitName = 'f';
      equal(deck.trumpSuitName, 'f');
      deck.returnAllCardsToDeck();
      equal(deck.trumpSuitName, '');
    });

    it(`[returnAllCardsToDeck] returns all cards to all cards stack, closes each card`, () => {
      const deck = new Deck(deckCardsData);
      const allCardsLength = deck.allCards.length;
      [deck.allCards, deck.takenCards] = [deck.takenCards, deck.allCards];
      equal(deck.allCards.length, 0);
      equal(deck.takenCards.length, allCardsLength);

      const card = getRandomElementFromArray(deck.takenCards);
      if (card) card.opened = true;
      const res = deck.returnAllCardsToDeck();

      equal(res, true);
      equal(deck.allCards.length, allCardsLength);
      equal(deck.takenCards.length, 0);
      // prettier-ignore
      equal(deck.allCards.some(c => c.opened), false);
    });
  });

  describe(`deck assigns trumpSuitName`, () => {
    it(`doesn't assign trumpSuitName if passed suitName is invalid, returns false`, () => {
      const deck = new Deck(deckCardsData);
      equal(deck.trumpSuitName, '');
      // @ts-expect-error: expected 1 argument
      equal(deck.assignTrumpSuit(), false);
      equal(deck.trumpSuitName, '');
      equal(deck.assignTrumpSuit('bla'), false);
    });

    it(`assigns trumpSuitName, returns true`, () => {
      const deck = new Deck(deckCardsData);
      equal(deck.assignTrumpSuit(deck.suitNames[0]), true);
      equal(deck.trumpSuitName, deck.suitNames[0]);
    });
  });

  describe(`deck clears trumpSuitName`, () => {
    it(`to empty string`, () => {
      const deck = new Deck(deckCardsData);
      deck.assignTrumpSuit(deck.suitNames[0]);
      deck.clearTrumpSuit();
      equal(deck.trumpSuitName, '');
    });
  });

  describe(`deck makes trumpCardsValues from trumpSuitCardsData`, () => {
    it(`makes if trumpSuitCardsData is not empty`, () => {
      const deck = new Deck(deckCardsData);
      const cardName = deck.trumpSuitCardsData[0][0];
      const cardValue = deck.trumpSuitCardsData[0][1];
      const cardRank = deck.trumpSuitCardsData[0][2];
      equal(deck.trumpCardsValues[cardName].value, cardValue);
      equal(deck.trumpCardsValues[cardName].rank, cardRank);
    });

    it(`doesn't make if trumpSuitCardsData is absent`, () => {
      const _deckCardsData = { ...deckCardsData };
      // @ts-expect-error: just for check if handles absent trumpSuitCardsData
      _deckCardsData.trumpSuitCardsData = undefined;
      const deck = new Deck(_deckCardsData);
      equal(isArray(deck.trumpSuitCardsData), true);
      equal(deck.trumpSuitCardsData.length, 0);
      equal(isObject(deck.trumpCardsValues), true);
      equal(Object.keys(deck.trumpCardsValues).length, 0);
    });
  });

  describe(`deck sets openedTrumpCard`, () => {
    it(`assigns openedTrumpCard and opens it`, () => {
      const deck = new Deck(deckCardsData);
      equal(deck.openedTrumpCard, null);
      deck.openTrumpCard();
      equal(isCard(deck.openedTrumpCard), true);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      equal(deck.openedTrumpCard!.opened, true);
    });
  });

  describe(`deck unsets openedTrumpCard`, () => {
    const deck = new Deck(deckCardsData);

    it(`[closeTrumpCard] does nothing if openedTrumpCard is not a card`, () => {
      equal(deck.openedTrumpCard, null);
      deck.closeTrumpCard();
      equal(deck.openedTrumpCard, null);
    });

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    it(`[closeTrumpCard] closes openedTrumpCard`, () => {
      deck.openTrumpCard();
      const card = deck.openedTrumpCard;
      equal(isCard(card), true);
      equal(card!.opened, true);
      deck.closeTrumpCard();
      equal(isCard(deck.openedTrumpCard), true);
      equal(deck.openedTrumpCard!.opened, false);
    });

    it(`[closeTrumpCardAndHide] closes openedTrumpCard and makes openedTrumpCard null`, () => {
      deck.openTrumpCard();
      const card = deck.openedTrumpCard;
      equal(isCard(card), true);

      equal(card!.opened, true);
      deck.closeTrumpCardAndHide();
      equal(deck.openedTrumpCard, null);
      equal(card!.opened, false);
    });
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
  });

  describe(`deck resets its state`, () => {
    it(`from arguments it was constructed with`, () => {
      const deck = new Deck(deckCardsData);

      const _suitNames = [...deck.suitNames];
      // TODO const _trumpSuitNameBefore = deck.trumpSuitName;
      // TODO const _trumpSuitNameAfter = deck.trumpSuitName;
      const _openedTrumpCard = deck.openedTrumpCard;
      const _shuffledLastTime = deck.shuffledLastTime;
      const _takenCardsLength = deck.takenCards.length;
      // TODO: const _trumpSuitCardsData = deck.trumpSuitCardsData...;

      // @ts-expect-error: constructDeck is protected and should not be accessed, ignore for testing
      const _constructDeck = deck.constructDeck;
      const _resetState = deck.resetState;

      const copyCardsState = (cards: Card[]) =>
        cards.map(c => cardKeys.map(k => c[k]));
      const copySuitsState = (suitNames: string[], deck: Deck) =>
        suitNames.map(n => ({
          name: n,
          cardsState: copyCardsState(deck.suits[n].cards),
        }));

      const _allCardsState = copyCardsState(deck.allCards);
      const _suitsState = copySuitsState(_suitNames, deck);

      // modify current state
      deck.takeRandomCardFromAllCards();
      deck.takeRandomCardFromAllCards();
      deck.takeRandomCardFromAllCards();
      // deck.makeTrumpSuit(deck.suitNames[0]);
      deck.openTrumpCard();
      deck.shuffleManyTimes();
      // deck.makeTrumpSuit(deck[deck.openedTrumpCard.suit]);

      deck.resetState();

      // prettier-ignore
      equal(deck.suitNames.every((n, i) => n === _suitNames[i]), true);
      equal(deck.openedTrumpCard, _openedTrumpCard);
      equal(deck.shuffledLastTime, _shuffledLastTime);
      equal(deck.takenCards.length, _takenCardsLength);
      // equal(deck.trumpSuitName, _trumpSuitName);
      // @ts-expect-error: constructDeck is protected and should not be accessed, ignore for testing
      equal(deck.constructDeck, _constructDeck);
      equal(deck.resetState, _resetState);

      const allCardsState = copyCardsState(deck.allCards);
      const areAllCardsStatesEqual = (prev: CardValues[], curr: CardValues[]) =>
        prev.every((cardData, i) =>
          cardData.every((val, y) => val === curr[i][y])
        );

      const suitsState = copySuitsState(deck.suitNames, deck);
      const areSuitsStatesEqual = (prev: SuitValues[], curr: SuitValues[]) =>
        prev.every((suitData, i) => {
          if (suitData.name === curr[i].name) {
            return areAllCardsStatesEqual(
              suitData.cardsState,
              curr[i].cardsState
            );
          }
        });

      equal(areAllCardsStatesEqual(_allCardsState, allCardsState), true);
      equal(areSuitsStatesEqual(_suitsState, suitsState), true);
      // equal(areTrumpSuitsEqual...)
    });
  });

  describe(`deck deals cards`, () => {
    const deck = new Deck(deckCardsData);

    it(`throws if playersQty || cardsQtyToPlayer is not string`, () => {
      const message = `playersQty, cardsQtyToPlayer aren't numbers or one/both of them is 0.`;
      // @ts-expect-error: expected 2-4 arguments
      throws(() => deck.deal(), { message });
      // @ts-expect-error: expected 2-4 arguments
      throws(() => deck.deal(''), { message });
      // @ts-expect-error: expected 2-4 arguments
      throws(() => deck.deal(null, true), { message });
    });

    it(`throws if buyInCardsQty is present as param but is not number`, () => {
      const message = 'buyInCardsQty must be number or undefined.';
      doesNotThrow(() => deck.deal(2, 4));
      // @ts-expect-error: buyInCardsQty is invalid
      throws(() => deck.deal(2, 4, true), { message });
    });

    it(`throws if not enough cards to deal every player`, () => {
      const msg1 = 'Not enough cards to deal (too many players).';
      const msg2 = 'Not enough cards to deal (one player wants impossible).';
      throws(() => deck.deal(30, 4), { message: msg1 });
      throws(() => deck.deal(1, 400), { message: msg2 });
    });

    it(`sets openedTrumpCard if openTrumpCard param is truthy`, () => {
      equal(deck.openedTrumpCard, null);
      deck.deal(3, 6, undefined, true);
      equal(isCard(deck.openedTrumpCard), true);
    });

    it(`shuffles many times`, () => {
      deck.shuffledLastTime = 0;
      deck.deal(3, 6, undefined, true);
      equal(deck.shuffledLastTime > 1, true);
    });

    it(`deals cards to players`, () => {
      const result = deck.deal(3, 6);
      equal(result.length, 3); // 3 players
      // each player got: [ [6 cards], [/*empty arr for buy-in cards*/] ]
      equal(
        result.every(pl => pl[0].length === 6 && pl[0].every(c => isCard(c))),
        true
      );
    });

    it(`deals cards and buy-in cards to players if buyInCardsQty param given`, () => {
      const result = deck.deal(3, 6, 3);
      equal(result.length, 3);
      // each player got: [ [6 cards], [3 buy-in cards] ]
      equal(
        result.every(pl => pl[0].length === 6 && pl[0].every(c => isCard(c))),
        true
      );
      equal(
        result.every(pl => pl[1].length === 3 && pl[1].every(c => isCard(c))),
        true
      );
    });
  });
});
