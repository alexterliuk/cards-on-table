import { strictEqual as equal, throws, doesNotThrow } from 'assert';
import {
  isArray,
  isFunction,
  isNull,
} from '../../../src/lib/utils/value-checkers.js';
import getRandomElementFromArray from '../../../src/lib/utils/get-random-element-from-array.js';
import Deck from '../../../src/game/inventory/deck.js';
import {
  defaultSuitNames as suitNames,
  defaultSuitData as suitData,
} from '../../../src/game/data/cards-data.js';

const isValidDeck = (
  deck,
  allCardsLength = 0,
  suitNamesLength = 0,
  takenCardsLength = 0,
  deckPropsQty = 8
) => {
  // prettier-ignore
  const result = [
    ['allCards', isArray(deck.allCards) && deck.allCards.length === allCardsLength],
    ['constructDeck', isFunction(deck.constructDeck)],
    ['openedTrumpCard', isNull(deck.openedTrumpCard)],
    ['resetState', isFunction(deck.resetState)],
    ['shuffledLastTime', deck.shuffledLastTime === 0],
    ['suitNamesLength', isArray(deck.suitNames) && deck.suitNames.length === suitNamesLength],
    ['takenCards', isArray(deck.takenCards) && deck.takenCards.length === takenCardsLength],
    ['trumpSuitName', deck.trumpSuitName === ''],
    ["deck's props quantity", Object.keys(deck).length === deckPropsQty],
  ];

  let name;
  result.some(v => (v[1] ? false : ((name = v[0]), true)));

  return name ? `[isValidDeck err]: ${name} is invalid` : true;
};

const isInstanceOf = (name, v) =>
  Object.getPrototypeOf(v).constructor.name === name;
const isCard = c => isInstanceOf('Card', c);
const isSuit = s => isInstanceOf('Suit', s);

describe(`Deck`, () => {
  describe(`new Deck()`, () => {
    it(`creates a template deck with empty data`, () => {
      const deck = new Deck();
      equal(isValidDeck(deck), true);
    });
  });

  describe(`new Deck(['hearts'], [['seven', 0, 1]])`, () => {
    it(`creates a deck with only one suit comprising only one card`, () => {
      const deck = new Deck(['hearts'], [['seven', 0, 1]]);
      equal(isValidDeck(deck, 1, 1, 0, 9), true);
      equal(deck.suitNames[0], 'hearts');
      equal(deck.hasOwnProperty('hearts'), true);
      equal(isSuit(deck.hearts), true);
      equal(isCard(deck.allCards[0]), true);
    });
  });

  describe(`new Deck(<defaultSuitNames>, <defaultSuitData>)`, () => {
    // prettier-ignore
    it(`creates a deck with 4 suits and 52 cards overall`, () => {
      const deck = new Deck(suitNames, suitData);
      equal(isValidDeck(deck, 52, 4, 0, 12), true);
      equal(suitNames.every(n => deck.suitNames.includes(n)), true);
      equal(suitNames.every(n => deck.hasOwnProperty(n)), true);
      equal(suitNames.every(n => isSuit(deck[n])), true);
      equal(deck.allCards.every(c => isCard(c)), true);
    });
  });

  describe(`deck shuffles cards`, () => {
    const deck = new Deck(suitNames, suitData);
    const cardsInOrigOrder = [...deck.allCards];
    const isShuffled = cardsBefore =>
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
    it(`takes first card`, () => {
      const deck = new Deck(suitNames, suitData);
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

    it(`takes random card`, () => {
      const deck = new Deck(suitNames, suitData);
      // omit test in case if defaultSuitData in future will be small data
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
    it(`does nothing and returns false if 1st arg is not card`, () => {
      const deck = new Deck(suitNames, suitData);
      const origAllCards = deck.allCards.map(c => c);
      equal(deck.takenCards.length, 0);

      const result = deck.returnCardToDeck();

      equal(result, false);
      equal(
        origAllCards.every((c, i) => c === deck.allCards[i]),
        true
      );
      equal(deck.takenCards.length, 0);
    });

    it(`takes card back to all cards, closes card and returns true`, () => {
      const deck = new Deck(suitNames, suitData);
      const allCardsLength = deck.allCards.length;
      const card = deck.takeCardFromAllCards();
      equal(allCardsLength !== deck.allCards.length, true);
      card.open();
      equal(card.opened, true);

      const result = deck.returnCardToDeck(card);

      equal(allCardsLength === deck.allCards.length, true);
      equal(card.opened, false);
      equal(result, true);
    });

    it(`takes random card back to all cards, closes card and returns true`, () => {
      const deck = new Deck(suitNames, suitData);
      // omit test in case if defaultSuitData in future will be small data
      if (deck.allCards.length > 5) {
        const allCardsLength = deck.allCards.length;
        const card1 = deck.takeCardFromAllCards();
        const card2 = deck.takeCardFromAllCards();
        const card3 = deck.takeCardFromAllCards();
        const card4 = deck.takeCardFromAllCards();
        const card5 = deck.takeCardFromAllCards();

        equal(allCardsLength === deck.allCards.length + 5, true);
        equal(deck.takenCards.length === 5, true);
        card1.open();
        card2.open();
        card3.open();
        card4.open();
        card5.open();

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
    it(`throws if allCards or takenCards have smth which is not card`, () => {
      let deck = new Deck(suitNames, suitData);
      deck.allCards.push({});
      throws(() => deck.returnAllCardsToDeck());

      deck = new Deck(suitNames, suitData);
      deck.takenCards.push(undefined);
      throws(() => deck.returnAllCardsToDeck());

      deck = new Deck(suitNames, suitData);
      deck.takeCardFromAllCards();
      deck.allCards.push(0);
      throws(() => deck.returnAllCardsToDeck());

      deck = new Deck(suitNames, suitData);
      deck.takeCardFromAllCards();
      deck.takeCardFromAllCards();
      deck.takeCardFromAllCards();
      deck.takenCards.push(true);
      throws(() => deck.returnAllCardsToDeck());
    });

    it(`makes trumpSuitName empty string`, () => {
      const deck = new Deck(suitNames, suitData);
      equal(deck.trumpSuitName, '');
      deck.trumpSuitName = 'f';
      equal(deck.trumpSuitName, 'f');
      deck.returnAllCardsToDeck();
      equal(deck.trumpSuitName, '');
    });

    it(`returns all cards to all cards stack, closes each card`, () => {
      const deck = new Deck(suitNames, suitData);
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
      equal(
        deck.allCards.some(c => c.opened),
        false
      );
    });
  });

  describe(`deck makes trumpSuitName`, () => {
    it(`doesn't assign trumpSuitName if suit is not Suit, returns false`, () => {
      const deck = new Deck(suitNames, suitData);
      equal(deck.trumpSuitName, '');
      equal(deck.makeTrumpSuit(), false);
      equal(deck.trumpSuitName, '');
    });

    it(`assigns trumpSuitName, returns true`, () => {
      const deck = new Deck(suitNames, suitData);
      equal(deck.makeTrumpSuit(deck[deck.suitNames[0]]), true);
      equal(deck.trumpSuitName, deck.suitNames[0]);
    });
  });

  describe(`deck resets trumpSuitName`, () => {
    it(`to empty string`, () => {
      const deck = new Deck(suitNames, suitData);
      deck.makeTrumpSuit(deck[deck.suitNames[0]]);
      deck.resetTrumpSuit();
      equal(deck.trumpSuitName, '');
    });
  });

  describe(`deck sets openedTrumpCard`, () => {
    it(`assigns openedTrumpCard and opens it`, () => {
      const deck = new Deck(suitNames, suitData);
      equal(deck.openedTrumpCard, null);
      deck.openTrumpCard();
      equal(isCard(deck.openedTrumpCard), true);
      equal(deck.openedTrumpCard.opened, true);
    });
  });

  describe(`deck unsets openedTrumpCard`, () => {
    const deck = new Deck(suitNames, suitData);

    it(`[closeTrumpCard] does nothing if openedTrumpCard is not a card`, () => {
      deck.openedTrumpCard = '';
      equal(deck.openedTrumpCard, '');
      deck.closeTrumpCard();
      equal(deck.openedTrumpCard, '');
    });

    it(`[closeTrumpCard] closes openedTrumpCard`, () => {
      deck.openTrumpCard();
      const card = deck.openedTrumpCard;
      equal(isCard(card), true);
      equal(card.opened, true);
      deck.closeTrumpCard();
      equal(isCard(deck.openedTrumpCard), true);
      equal(deck.openedTrumpCard.opened, false);
    });

    it(`[closeTrumpCardAndHide] closes openedTrumpCard and makes openedTrumpCard null`, () => {
      deck.openTrumpCard();
      const card = deck.openedTrumpCard;
      equal(isCard(card), true);
      equal(card.opened, true);
      deck.closeTrumpCardAndHide();
      equal(deck.openedTrumpCard, null);
      equal(card.opened, false);
    });
  });

  describe(`deck resets its state`, () => {
    it(`from arguments it was constructed with`, () => {
      const deck = new Deck(suitNames, suitData);

      const _suitNames = [...deck.suitNames];
      const _openedTrumpCard = deck.openedTrumpCard;
      const _shuffledLastTime = deck.shuffledLastTime;
      const _takenCardsLength = deck.takenCards.length;
      const _trumpSuitName = deck.trumpSuitName;
      const _constructDeck = deck.constructDeck;
      const _resetState = deck.resetState;

      const copyCardsState = cards =>
        cards.map(c => Object.keys(c).map(k => c[k]));
      const copySuitsState = (suitNames, deck) =>
        suitNames.map(n => [n, copyCardsState(deck[n].cards)]);

      const _allCardsState = copyCardsState(deck.allCards);
      const _suitsState = copySuitsState(_suitNames, deck);

      // modify current state
      deck.takeRandomCardFromAllCards();
      deck.takeRandomCardFromAllCards();
      deck.takeRandomCardFromAllCards();
      deck.makeTrumpSuit(deck.suitNames[0]);
      deck.openTrumpCard();
      deck.shuffleManyTimes();
      deck.makeTrumpSuit(deck[deck.openedTrumpCard.suit]);

      deck.resetState();

      // prettier-ignore
      equal(deck.suitNames.every((n, i) => n === _suitNames[i]), true);
      equal(deck.openedTrumpCard, _openedTrumpCard);
      equal(deck.shuffledLastTime, _shuffledLastTime);
      equal(deck.takenCards.length, _takenCardsLength);
      equal(deck.trumpSuitName, _trumpSuitName);
      equal(deck.constructDeck, _constructDeck);
      equal(deck.resetState, _resetState);

      const allCardsState = copyCardsState(deck.allCards);
      const areAllCardsStatesEqual = (prev, curr) =>
        prev.every((cardData, i) =>
          cardData.every((val, y) => val === curr[i][y])
        );

      const suitsState = copySuitsState(deck.suitNames, deck);
      const areSuitsStatesEqual = (prev, curr) =>
        prev.every(
          (suitData, i) =>
            suitData[0] /*name*/ === curr[i][0] &&
            areAllCardsStatesEqual(suitData[1], curr[i][1])
        );

      equal(areAllCardsStatesEqual(_allCardsState, allCardsState), true);
      equal(areSuitsStatesEqual(_suitsState, suitsState), true);
    });
  });

  describe(`deck deals cards`, () => {
    const deck = new Deck(suitNames, suitData);

    it(`throws if playersQty || cardsQtyToPlayer is not string`, () => {
      const message = `playersQty, cardsQtyToPlayer aren't numbers or one/both of them is 0.`;
      throws(() => deck.deal(), { message });
      throws(() => deck.deal(''), { message });
      throws(() => deck.deal(null, true), { message });
    });

    it(`throws if buyInCardsQty is present as param but is not number`, () => {
      const message = 'buyInCardsQty must be number or undefined.';
      doesNotThrow(() => deck.deal(2, 4));
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
