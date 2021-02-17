import { strictEqual as equal, throws } from 'assert';
import deckCardsData from '../../src/data/deck-cards-data';
import Deck from '../../src/inventory/deck';
import Card from '../../src/inventory/card';
import Table from '../../src/inventory/table';
import Player from '../../src/actors/player';

const getDnP = () => {
  const deck = new Deck(deckCardsData);
  const player = new Player(deck);
  return { deck, player };
};

// player's methods which are simple wrapers of deck's methods are not tested,
// also no tests for some methods which simply direct logic to already tested method
describe(`Player`, () => {
  describe(`new Player()`, () => {
    it(`throws because no deck was given`, () => {
      // @ts-expect-error: must be 1 argument
      throws(() => new Player());
    });
  });

  describe(`new Player(deck), base methods which interact with own cards and combinations`, () => {
    it(`creates a player`, () => {
      const { deck, player } = getDnP();
      equal(player instanceof Player, true);
      equal(player.deck, deck);
      equal(player.ownCards.length, 0);
      equal(player.combinations.length, 0);
      equal(player.fines.length, 0);
      equal(player.bonuses.length, 0);
    });

    it(`connects to table`, () => {
      const { deck, player } = getDnP();
      equal(player.isConnectedToTable(), false);
      new Table(deck, [player]);
      equal(player.isConnectedToTable(), true);
    });

    it(`[addCardToOwnCards] adds card to own cards`, () => {
      const { deck, player } = getDnP();
      const res = player.addCardToOwnCards(deck.allCards[0]);
      equal(res, true);
      equal(player.ownCards[0], deck.allCards[0]);
    });

    it(`[addCardToOwnCards] returns false if attempt to add a card which is already in own cards`, () => {
      const { deck, player } = getDnP();
      player.addCardToOwnCards(deck.allCards[0]);
      equal(player.ownCards[0], deck.allCards[0]);
      const res = player.addCardToOwnCards(deck.allCards[0]);
      equal(res, false);
    });

    it(`[addCardToOwnCards] adds card to own cards to given index (or to start/end if index < 0 or > ownCards.length)`, () => {
      const { deck, player } = getDnP();
      player.ownCards = [deck.allCards[0], deck.allCards[1], deck.allCards[2]];
      player.addCardToOwnCards(deck.allCards[3], 1);
      equal(player.ownCards[1], deck.allCards[3]);
      player.addCardToOwnCards(deck.allCards[4], 17);
      equal(player.ownCards[player.ownCards.length - 1], deck.allCards[4]);
      player.addCardToOwnCards(deck.allCards[5], -10);
      equal(player.ownCards[0], deck.allCards[5]);
    });

    it(`[removeCardFromOwnCards] removes card from own cards, returns index of card before removal`, () => {
      const { deck, player } = getDnP();
      player.addCardToOwnCards(deck.allCards[0]);
      const res = player.removeCardFromOwnCards(player.ownCards[0]);
      equal(res, 0);
    });

    it(`[removeCardFromOwnCards] returns -1 if attempt to remove a card which is absent in own cards`, () => {
      const { deck, player } = getDnP();
      player.addCardToOwnCards(deck.allCards[0]);
      const res = player.removeCardFromOwnCards(player.ownCards[3]);
      equal(res, -1);
    });

    it(`[takeRandomCardFromOwnCards] returns { card: null, idx: -1 } if no cards in ownCards`, () => {
      const { player } = getDnP();
      const res = player.takeRandomCardFromOwnCards();
      equal(res.card, null);
      equal(res.idx, -1);
    });

    it(`[takeRandomCardFromOwnCards] takes random cards from own cards`, () => {
      const { deck, player } = getDnP();
      player.ownCards = deck.allCards;
      const allCardsLength = deck.allCards.length;
      equal(player.ownCards.length, deck.allCards.length);
      const res1 = player.takeRandomCardFromOwnCards();
      const res2 = player.takeRandomCardFromOwnCards();
      const res3 = player.takeRandomCardFromOwnCards();
      const res4 = player.takeRandomCardFromOwnCards();
      equal(player.ownCards.length, deck.allCards.length);
      equal(player.ownCards.length, allCardsLength - 4);
      const idx1 = res1.idx;
      const idx2 = res2.idx;
      const idx3 = res3.idx;
      const idx4 = res4.idx;
      const res = [
        idx1 !== idx2 - 1 && idx1 !== idx2 + 1,
        idx2 !== idx3 - 1 && idx2 !== idx3 + 1,
        idx3 !== idx4 - 1 && idx3 !== idx4 + 1,
      ];
      equal(res.includes(true), true);
    });

    it(`[addCombinationToCombinations] adds combination and returns true`, () => {
      const { deck, player } = getDnP();
      const comb = deck.allCards.slice(0, 3);
      const added = player.addCombinationToCombinations(comb);
      equal(added, true);
      equal(player.combinations.length, 1);
      equal(player.combinations[0].length, 3);
    });

    it(`[addCombinationToCombinations] does not add combination if its card is already in another combination, returns false`, () => {
      const { deck, player } = getDnP();
      player.combinations.push([deck.allCards[0], deck.allCards[1]]);
      equal(player.combinations.length, 1);
      const comb = [deck.allCards[0]].concat(deck.allCards.slice(0, 3));
      const added = player.addCombinationToCombinations(comb);
      equal(added, false);
      equal(player.combinations.length, 1);
    });

    it(`[addCombinationToCombinations] does not add combination if its card is found in own cards, returns false`, () => {
      const { deck, player } = getDnP();
      player.takeCardFromDeck();
      equal(player.ownCards[0], deck.takenCards[0]);
      const comb = [player.ownCards[0]].concat(deck.allCards.slice(0, 3));
      const added = player.addCombinationToCombinations(comb);
      equal(added, false);
      equal(player.combinations.length, 0);
    });

    it(`[addCombinationToCombinationsFromOwnCards] adds combination, removes its cards from own cards, returns true`, () => {
      const { deck, player } = getDnP();
      const comb = deck.allCards.slice(0, 3);
      player.takeCardFromDeck();
      player.takeCardFromDeck();
      player.takeCardFromDeck();
      equal(player.ownCards.length, 3);
      const added = player.addCombinationToCombinationsFromOwnCards(comb);
      equal(added, true);
      equal(player.combinations.length, 1);
      equal(player.combinations[0].length, 3);
      equal(player.ownCards.length, 0);
    });

    it(`[addCombinationToCombinationsFromOwnCards] does not add combination if own cards doesn't contain needed cards, returns false`, () => {
      const { deck, player } = getDnP();
      const comb = deck.allCards.slice(0, 3);
      let added = player.addCombinationToCombinationsFromOwnCards(comb);
      equal(added, false);
      player.takeCardFromDeck();
      player.takeCardFromDeck();
      equal(player.ownCards.length, 2);
      added = player.addCombinationToCombinationsFromOwnCards(comb);
      equal(added, false);
      equal(player.combinations.length, 0);
      equal(player.ownCards.length, 2);
    });

    it(`[addCombinationToBulkOfPlayerFromCombinations] adds combination and returns true`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      const bulkOfPlayer = table.playersBulks.find(b => b.player === player);
      equal(bulkOfPlayer?.player, player);
      const comb = deck.allCards.slice(0, 3);
      player.combinations.push(comb);
      const added = player.addCombinationToBulkOfPlayerFromCombinations(comb);
      equal(added, true);
      equal(player.combinations.length, 0);
      equal(Array.isArray(bulkOfPlayer.cards[0]), true);
      const addedComb = bulkOfPlayer.cards[0] as Card[];
      equal(addedComb.length, 3);
    });

    it(`[addCombinationToBulkOfPlayerFromCombinations] does not add combination if no such combination in combinations, returns false`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      const bulkOfPlayer = table.playersBulks.find(b => b.player === player);
      equal(bulkOfPlayer?.player, player);
      const comb = deck.allCards.slice(0, 3);
      // push smaller combination
      player.combinations.push(comb.slice(1));
      const added = player.addCombinationToBulkOfPlayerFromCombinations(comb);
      equal(added, false);
      equal(player.combinations.length, 1);
      equal(bulkOfPlayer.cards[0], undefined);
    });

    it(`[addCombinationToCombinationsFromBulkOfPlayer] adds combination and returns true`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      const bulkOfPlayer = table.playersBulks.find(b => b.player === player);
      equal(bulkOfPlayer?.player, player);
      const comb = deck.allCards.slice(0, 3);
      bulkOfPlayer.cards.push(comb);
      equal(player.combinations.length, 0);
      equal(Array.isArray(bulkOfPlayer.cards[0]), true);
      const added = player.addCombinationToCombinationsFromBulkOfPlayer(comb);
      equal(added, true);
      equal(player.combinations.length, 1);
      equal(bulkOfPlayer.cards[0], undefined);
    });

    it(`[returnCombinationToOwnCards] returns combination to own cards and returns true`, () => {
      const { deck, player } = getDnP();
      const comb = deck.allCards.slice(0, 3);
      player.combinations.push(comb);
      equal(player.combinations.length, 1);
      equal(player.ownCards.length, 0);
      const returned = player.returnCombinationToOwnCards(comb);
      equal(returned, true);
      equal(player.combinations.length, 0);
      equal(player.ownCards.length, 3);
    });

    it(`[returnCombinationToOwnCards] does not return combination to own cards if a card from it already in own cards, returns false`, () => {
      const { deck, player } = getDnP();
      const comb = deck.allCards.slice(0, 3);
      player.combinations.push(comb);
      player.ownCards.push(comb[1]);
      equal(player.combinations.length, 1);
      equal(player.ownCards.length, 1);
      const returned = player.returnCombinationToOwnCards(comb);
      equal(returned, false);
      equal(player.combinations.length, 1);
      equal(player.ownCards.length, 1);
    });
  });

  describe(`new Player(deck), methods which interact with deck`, () => {
    it(`[returnObtainedCardBackToDeck] throws if attempt to return a card which is absent in deck.takenCards`, () => {
      const { deck, player } = getDnP();
      equal(deck.takenCards.length, 0);
      throws(() => player.returnObtainedCardBackToDeck(deck.allCards[0]));
    });

    it(`[returnObtainedCardBackToDeck] returns obtained from deck card back to deck`, () => {
      const { deck, player } = getDnP();
      const allCardsLength = deck.allCards.length;
      const card = deck.allCards.splice(0, 1)[0];
      deck.takenCards.push(card);
      equal(card instanceof Card, true);
      equal(deck.allCards.length, allCardsLength - 1);
      equal(deck.takenCards.length, 1);
      const res = player.returnObtainedCardBackToDeck(card);
      equal(res, true);
      equal(deck.allCards.length, allCardsLength);
      equal(deck.takenCards.length, 0);
    });

    it(`[returnOwnCardBackToOwnCards] throws if attempt to return a card which is already present in players' own cards`, () => {
      const { deck, player } = getDnP();
      player.ownCards.push(deck.allCards[0]);
      throws(() => player.returnOwnCardBackToOwnCards(deck.allCards[0]));
    });

    it(`[takeCardFromDeck] takes card from deck`, () => {
      const { deck, player } = getDnP();
      const allCardsLength = deck.allCards.length;
      const card = player.takeCardFromDeck();
      equal(deck.allCards.length, allCardsLength - 1);
      equal(deck.takenCards[0], card);
      equal(player.ownCards.length, 1);
      equal(player.ownCards[0], card);
    });

    it(`[takeRandomCardFromDeck] takes random cards from deck`, () => {
      const { deck, player } = getDnP();
      const copiedAllCards = deck.allCards.map(c => c);
      const card1 = player.takeRandomCardFromDeck();
      const card2 = player.takeRandomCardFromDeck();
      const card3 = player.takeRandomCardFromDeck();
      const card4 = player.takeRandomCardFromDeck();
      equal(player.ownCards.length, deck.takenCards.length);
      equal(
        deck.allCards.length + deck.takenCards.length,
        copiedAllCards.length
      );
      const idxInCopied1 = copiedAllCards.findIndex(c => c === card1);
      const idxInCopied2 = copiedAllCards.findIndex(c => c === card2);
      const idxInCopied3 = copiedAllCards.findIndex(c => c === card3);
      const idxInCopied4 = copiedAllCards.findIndex(c => c === card4);
      const res = [
        idxInCopied1 !== idxInCopied2 - 1 && idxInCopied1 !== idxInCopied2 + 1,
        idxInCopied2 !== idxInCopied3 - 1 && idxInCopied2 !== idxInCopied3 + 1,
        idxInCopied3 !== idxInCopied4 - 1 && idxInCopied3 !== idxInCopied4 + 1,
      ];
      equal(res.includes(true), true);
    });

    it(`[returnOwnCardToDeck] returns player's own card to deck`, () => {
      const { deck, player } = getDnP();
      const allCardsLength = deck.allCards.length;
      const card = player.takeCardFromDeck();
      equal(player.ownCards[0], card);
      equal(deck.allCards.length, allCardsLength - 1);
      equal(deck.takenCards[0], card);
      equal(card instanceof Card, true);
      // wrap in if for TS to get rid of 'possibly null' err
      if (card instanceof Card) {
        const res = player.returnOwnCardToDeck(card);
        equal(res, true);
      }
      equal(player.ownCards.length, 0);
      equal(deck.allCards.length, allCardsLength);
      equal(deck.takenCards.length, 0);
    });

    it(`[returnOwnCardToDeck] returns false if card not found in own cards`, () => {
      const { deck, player } = getDnP();
      const res = player.returnOwnCardToDeck(deck.allCards[0]);
      equal(res, false);
    });

    it(`[returnOwnCardToDeck] returns own card back to own cards to index where it was, if returning to deck has failed`, () => {
      const { deck, player } = getDnP();
      /* eslint-disable */
      deck.returnCardToDeck = (card: Card | null, idxInTakenCards?: number | null, toStart?: 'toStart') => false;
      /* eslint-enable */
      player.ownCards = [deck.allCards[0], deck.allCards[1], deck.allCards[2]];
      const card = player.ownCards[1];
      const res = player.returnOwnCardToDeck(card);
      equal(res, false);
      equal(player.ownCards[0], deck.allCards[0]);
      equal(player.ownCards[1], deck.allCards[1]);
      equal(player.ownCards[2], deck.allCards[2]);
    });

    it(`[returnRandomOwnCardToDeck] returns player's random own card to deck`, () => {
      // randomness not tested, because takeRandomCardFromDeck has already been tested
      const { deck, player } = getDnP();
      const copiedAllCards = deck.allCards.map(c => c);
      player.takeRandomCardFromDeck();
      player.takeRandomCardFromDeck();
      player.takeRandomCardFromDeck();
      equal(player.ownCards.length, 3);
      equal(deck.allCards.length, copiedAllCards.length - 3);
      equal(deck.takenCards.length, 3);
      const res = player.returnRandomOwnCardToDeck();
      equal(res, true);
      equal(player.ownCards.length, 2);
      equal(deck.allCards.length, copiedAllCards.length - 2);
      equal(deck.takenCards.length, 2);
    });

    it(`[returnRandomOwnCardToDeck] returns false if no random card obtained from own cards`, () => {
      const { player } = getDnP();
      const res = player.returnRandomOwnCardToDeck();
      equal(res, false);
    });

    it(`[returnRandomOwnCardToDeck] returns own random card back to own cards to index where it was, if returning card to deck has failed`, () => {
      const { deck, player } = getDnP();
      /* eslint-disable */
      deck.returnCardToDeck = (card: Card | null, idxInTakenCards?: number | null, toStart?: 'toStart') => false;
      /* eslint-enable */
      player.ownCards = [deck.allCards[0], deck.allCards[1], deck.allCards[2]];
      const res = player.returnRandomOwnCardToDeck();
      equal(res, false);
      equal(player.ownCards.length, 3);
    });

    it(`[returnAllOwnCardsToDeck] returns all own cards to deck`, () => {
      const { player } = getDnP();
      player.takeRandomCardFromDeck();
      player.takeRandomCardFromDeck();
      player.takeRandomCardFromDeck();
      equal(player.ownCards.length, 3);
      const res = player.returnAllOwnCardsToDeck();
      equal(res, true);
      equal(player.ownCards.length, 0);
    });
  });
});
