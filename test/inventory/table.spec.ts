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

describe(`Table`, () => {
  describe(`new Table not created with invalid arguments`, () => {
    it(`throws if called without arguments`, () => {
      // @ts-expect-error: must be 2 arguments
      throws(() => new Table());
    });
    it(`throws if not deck was given`, () => {
      const { player } = getDnP();
      // @ts-expect-error: must be 2 arguments
      throws(() => new Table(null, [player]));
    });
    it(`throws if array with not players was given`, () => {
      const { deck } = getDnP();
      // @ts-expect-error: must be 2 arguments
      throws(() => new Table(deck, [true]));
    });
  });

  describe(`new Table is created with valid arguments`, () => {
    it(`created when only deck given`, () => {
      const { deck } = getDnP();
      const table = new Table(deck);
      equal(table instanceof Table, true);
      equal(table.deck instanceof Deck, true);
    });

    it(`created when deck and players given`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      equal(table instanceof Table, true);
      equal(table.deck instanceof Deck, true);
      equal(table.playersCorners[0].player instanceof Player, true);
    });

    it(`once table is created all players are connected to it`, () => {
      const { deck, player } = getDnP();
      const player2 = new Player(deck);
      const table = new Table(deck, [player, player2]);
      equal(table.playersCorners.length, 2);
      equal(table.playersCorners[0].player.isConnectedToTable(), true);
      equal(table.playersCorners[1].player.isConnectedToTable(), true);
    });
  });

  describe(`[addPlayer]`, () => {
    it(`adds player to table`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      const player2 = new Player(deck);
      equal(table.getAllPlayers().length, 1);
      const added = table.addPlayer(player2);
      equal(added, true);
      equal(table.getAllPlayers().length, 2);
      equal(player2.deck, deck);
    });

    it(`does not add already existing player to table`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      equal(table.getAllPlayers().length, 1);
      const added = table.addPlayer(player);
      equal(added, false);
      equal(table.getAllPlayers().length, 1);
    });
  });

  describe(`[removePlayer]`, () => {
    it(`removes player from table`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      const [c1, c2, c3, c4, c5, c6, c7, c8] = deck.allCards;
      player.ownCards = [c1, c2];
      player.combinations = [[c3, c4, c5]];
      table.playersBulks[1].cards = [c6, [c7, c8]];

      equal(table.getAllPlayers().length, 1);
      equal(table.playersBulks.length, 2); // first is fake (null) player
      const removed = table.removePlayer(player);
      equal(removed, true);
      equal(table.getAllPlayers().length, 0);
      equal(table.playersBulks.length, 1);
      equal(player.ownCards.length, 0);
      equal(player.combinations.length, 0);
      equal(table.discardPile.length, 8);
    });

    it(`does not remove unknown (not connected to table) player`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      const player2 = new Player(deck);
      equal(table.getAllPlayers().length, 1);
      const removed = table.removePlayer(player2);
      equal(removed, false);
      equal(table.getAllPlayers().length, 1);
    });
  });

  describe(`[addCardToDiscardPile]`, () => {
    it(`adds a card and returns true`, () => {
      const { deck } = getDnP();
      const table = new Table(deck);
      equal(table.discardPile.length, 0);
      const added = table.addCardToDiscardPile(deck.allCards[0]);
      equal(added, true);
      equal(table.discardPile.length, 1);
    });

    it(`does not add a card if discardPile already includes such card, returns false`, () => {
      const { deck } = getDnP();
      const table = new Table(deck);
      const card = deck.allCards[0];
      table.discardPile.push(card);
      equal(table.discardPile.length, 1);
      const added = table.addCardToDiscardPile(card);
      equal(added, false);
      equal(table.discardPile.length, 1);
    });
  });

  describe(`[addCombinationToDiscardPile]`, () => {
    it(`adds a combination as standalone cards and returns true`, () => {
      const { deck } = getDnP();
      const table = new Table(deck);
      const comb = deck.allCards.slice(0, 3);
      const added = table.addCombinationToDiscardPile(comb);
      equal(added, true);
      equal(table.discardPile.length, 3);
    });

    it(`does not add a combination if any of its cards is already in discardPile, returns false`, () => {
      const { deck } = getDnP();
      const table = new Table(deck);
      const comb = deck.allCards.slice(0, 3);
      table.discardPile.push(deck.allCards[1]);
      equal(table.discardPile.length, 1);
      const added = table.addCombinationToDiscardPile(comb);
      equal(added, false);
      equal(table.discardPile.length, 1);
    });
  });

  describe(`[getAllCardsFromPlayersBulks]`, () => {
    it(`returns all cards (not removes them from playersBulks)`, () => {
      const { deck, player } = getDnP();
      const player2 = new Player(deck);
      const table = new Table(deck, [player, player2]);
      // first bulkOfPlayer is null player's bulk, used to store cards not related to real players
      equal(table.playersBulks.length, 3);
      const [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10] = deck.allCards;
      table.playersBulks[0].cards = [c1];
      table.playersBulks[1].cards = [c2, c3];
      table.playersBulks[2].cards = [c4, c5, c6, c7, c8, c9, c10];

      const cards = table.getAllCardsFromPlayersBulks();
      equal(cards.length, 10);
      equal(table.playersBulks[0].cards.length, 1);
      equal(table.playersBulks[1].cards.length, 2);
      equal(table.playersBulks[2].cards.length, 7);
    });
  });

  describe(`[getBulkOfPlayer]`, () => {
    it(`returns bulk of a real player`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      equal(table.playersBulks.length, 2);
      const [c1, c2, c3, c4] = deck.allCards;
      table.playersBulks[0].cards = [c1];
      table.playersBulks[1].cards = [c2, c3, c4];
      const bulkOfPlayer = table.getBulkOfPlayer(player);
      equal(bulkOfPlayer?.cards.length, 3);
    });

    it(`returns bulk of fake (null) player`, () => {
      const { deck } = getDnP();
      const table = new Table(deck);
      table.playersBulks[0].cards = deck.allCards.slice(0, 4);
      const bulkOfPlayer = table.getBulkOfPlayer(null);
      equal(bulkOfPlayer?.cards.length, 4);
    });

    it(`returns null if called with unknown player (i.e. not connected to table)`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck);
      table.playersBulks[0].cards = deck.allCards.slice(0, 4);
      const bulkOfPlayer = table.getBulkOfPlayer(player);
      equal(bulkOfPlayer, null);
    });
  });

  describe(`[addCardToBeatArea]`, () => {
    it(`adds a card to beat area, returns true`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      const [c1] = deck.allCards;
      equal(table.beatArea.length, 0);
      const added = table.addCardToBeatArea(c1, player);
      equal(added, true);
      equal(table.beatArea.length, 1);
      equal(table.beatArea[0].player, player);
      equal(table.beatArea[0].cards[0], c1);
    });

    it(`does not a card to beat area if it already has such card, returns false`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      const [c1] = deck.allCards;
      table.beatArea.push({ player, cards: [c1] });
      equal(table.beatArea.length, 1);
      const added = table.addCardToBeatArea(c1, player);
      equal(added, false);
      equal(table.beatArea.length, 1);
      equal(table.beatArea[0].player, player);
      equal(table.beatArea[0].cards[0], c1);
    });
  });

  describe(`[addTakeToTakes]`, () => {
    it(`add a take to player's takes collection, returns true`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      const [c1, c2, c3] = deck.allCards;
      equal(table.playersCorners[0].takes.length, 0);
      const added = table.addTakeToTakes([c1, c2, c3], player);
      equal(added, true);
      equal(table.playersCorners[0].takes.length, 1);
      equal(table.playersCorners[0].takes[0].length, 3);
    });

    it(`does not add a take if player's takes collection already includes a card from this take, returns false`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      const [c1, c2, c3] = deck.allCards;
      table.playersCorners[0].takes.push([c2]);
      equal(table.playersCorners[0].takes.length, 1);
      const added = table.addTakeToTakes([c1, c2, c3], player);
      equal(added, false);
      equal(table.playersCorners[0].takes.length, 1);
      equal(table.playersCorners[0].takes[0].length, 1);
    });
  });

  describe(`[addCardOrCombinationToBulkOfPlayer]`, () => {
    it(`adds a card and returns true`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);

      const bulkOfPlayer = table.getBulkOfPlayer(player);
      equal(bulkOfPlayer?.cards.length, 0);
      const card = deck.allCards[0];
      const added = table.addCardOrCombinationToBulkOfPlayer(card, player);
      equal(added, true);
      equal(bulkOfPlayer?.cards.length, 1);

      const bulkOfNullPlayer = table.getBulkOfPlayer(null);
      equal(bulkOfNullPlayer?.cards.length, 0);
      const added1 = table.addCardOrCombinationToBulkOfPlayer(card, null);
      equal(added1, true);
      equal(bulkOfNullPlayer?.cards.length, 1);
    });

    it(`adds a combination and returns true`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);

      const bulkOfPlayer = table.getBulkOfPlayer(player);
      const comb = deck.allCards.slice(0, 3);
      const added = table.addCardOrCombinationToBulkOfPlayer(comb, player);
      equal(added, true);
      equal(bulkOfPlayer?.cards.length, 1);
      const addedComb = bulkOfPlayer?.cards[0] as Card[];
      equal(addedComb.length, 3);

      const bulkOfNullPlayer = table.getBulkOfPlayer(null);
      const added1 = table.addCardOrCombinationToBulkOfPlayer(comb, null);
      equal(added1, true);
      equal(bulkOfNullPlayer?.cards.length, 1);
      const addedComb1 = bulkOfNullPlayer?.cards[0] as Card[];
      equal(addedComb1.length, 3);
    });
  });

  describe(`[addCardToBulkOfPlayer]`, () => {
    it(`adds a card and returns true`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      const bulkOfPlayer = table.getBulkOfPlayer(player);
      equal(bulkOfPlayer?.cards.length, 0);
      const card = deck.allCards[0];

      const added = table.addCardToBulkOfPlayer(card, player);
      equal(added, true);
      equal(bulkOfPlayer?.cards.length, 1);
    });

    it(`does not add a card if such card is already in any of playersBulks, returns false`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      const bulkOfPlayer = table.getBulkOfPlayer(player);
      const card = deck.allCards[0];
      bulkOfPlayer?.cards.push(card);
      equal(bulkOfPlayer?.cards.length, 1);

      const added = table.addCardToBulkOfPlayer(card, player);
      equal(added, false);
      equal(bulkOfPlayer?.cards.length, 1);
    });
  });

  describe(`[addCombinationToBulkOfPlayer]`, () => {
    it(`adds a combination and returns true`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      const bulkOfPlayer = table.getBulkOfPlayer(player);
      equal(bulkOfPlayer?.cards.length, 0);
      const comb = deck.allCards.slice(0, 2);

      const added = table.addCombinationToBulkOfPlayer(comb, player);
      equal(added, true);
      equal(bulkOfPlayer?.cards.length, 1);
      const addedComb = bulkOfPlayer?.cards[0] as Card[];
      equal(addedComb.length, 2);
    });

    it(`does not add a combination if it includes a card which is already in any of playersBulks, returns false`, () => {
      const { deck, player } = getDnP();
      const player2 = new Player(deck);
      const player3 = new Player(deck);
      const table = new Table(deck, [player, player2, player3]);
      const [c1, c2, c3, c4, c5] = deck.allCards;
      const bulkOfPlayer = table.getBulkOfPlayer(player);
      const bulkOfPlayer2 = table.getBulkOfPlayer(player2);
      const bulkOfPlayer3 = table.getBulkOfPlayer(player3);
      bulkOfPlayer2?.cards.push(c1);
      bulkOfPlayer3?.cards.push(c2);
      equal(bulkOfPlayer?.cards.length, 0);
      equal(bulkOfPlayer2?.cards.length, 1);
      equal(bulkOfPlayer3?.cards.length, 1);

      const comb = [c1, c2, c3, c4, c5];
      const added = table.addCombinationToBulkOfPlayer(comb, player);
      equal(added, false);
      equal(bulkOfPlayer?.cards.length, 0);
      equal(bulkOfPlayer2?.cards.length, 1);
      equal(bulkOfPlayer3?.cards.length, 1);
    });
  });

  describe(`[takeCardFromBulkOfPlayer]`, () => {
    it(`takes a card, adds it to discardPile and also returns it`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      const bulkOfPlayer = table.getBulkOfPlayer(player);
      const card = deck.allCards[0];
      bulkOfPlayer?.cards.push(card);
      equal(bulkOfPlayer?.cards.length, 1);
      equal(table.discardPile.length, 0);

      const taken = table.takeCardFromBulkOfPlayer(card, player, 'discardPile');
      equal(taken, card);
      equal(bulkOfPlayer?.cards.length, 0);
      equal(table.discardPile.length, 1);
    });

    it(`takes a card, adds it to player's own cards and also returns it`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      const bulkOfPlayer = table.getBulkOfPlayer(player);
      const card = deck.allCards[0];
      bulkOfPlayer?.cards.push(card);
      equal(bulkOfPlayer?.cards.length, 1);
      equal(player.ownCards.length, 0);

      const taken = table.takeCardFromBulkOfPlayer(card, player, 'ownCards');
      equal(taken, card);
      equal(bulkOfPlayer?.cards.length, 0);
      equal(player.ownCards.length, 1);
    });

    it(`does not take a card, if called with real player but no destination given, returns null`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      const bulkOfPlayer = table.getBulkOfPlayer(player);
      const card = deck.allCards[0];
      bulkOfPlayer?.cards.push(card);
      equal(bulkOfPlayer?.cards.length, 1);
      equal(player.ownCards.length, 0);

      const taken = table.takeCardFromBulkOfPlayer(card, player);
      equal(taken, null);
      equal(bulkOfPlayer?.cards.length, 1);
      equal(player.ownCards.length, 0);
      equal(table.discardPile.length, 0);
    });

    it(`takes a card from fake (null) player's bulk, if called with null as player and no destination given,
        adds it to discardPile, and returns it`, () => {
      const { deck } = getDnP();
      const table = new Table(deck);
      const bulkOfPlayer = table.getBulkOfPlayer(null);
      const card = deck.allCards[0];
      bulkOfPlayer?.cards.push(card);
      equal(bulkOfPlayer?.cards.length, 1);

      const taken = table.takeCardFromBulkOfPlayer(card, null);
      equal(taken, card);
      equal(bulkOfPlayer?.cards.length, 0);
      equal(table.discardPile.length, 1);
    });
  });

  describe(`[takeCombinationFromBulkOfPlayer]`, () => {
    it(`takes a combination, adds it as standalone cards to discardPile and also returns it`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      const bulkOfPlayer = table.getBulkOfPlayer(player);
      const comb = deck.allCards.slice(0, 3);
      bulkOfPlayer?.cards.push(comb);
      equal(bulkOfPlayer?.cards.length, 1);
      equal(table.discardPile.length, 0);

      // prettier-ignore
      const taken = table.takeCombinationFromBulkOfPlayer(comb, player, 'discardPile');
      equal(taken?.length, 3);
      equal(bulkOfPlayer?.cards.length, 0);
      equal(table.discardPile.length, 3);
    });

    it(`takes a combination, adds it to player's combinations and also returns it`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      const bulkOfPlayer = table.getBulkOfPlayer(player);
      const comb = deck.allCards.slice(0, 3);
      bulkOfPlayer?.cards.push(comb);
      equal(bulkOfPlayer?.cards.length, 1);
      equal(player.combinations.length, 0);

      // prettier-ignore
      const taken = table.takeCombinationFromBulkOfPlayer(comb, player, 'combinations');
      equal(taken?.length, 3);
      equal(bulkOfPlayer?.cards.length, 0);
      equal(player.combinations.length, 1);
    });

    it(`does not take a combination, if called with real player but no destination given, returns null`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      const bulkOfPlayer = table.getBulkOfPlayer(player);
      const comb = deck.allCards.slice(0, 3);
      bulkOfPlayer?.cards.push(comb);
      equal(bulkOfPlayer?.cards.length, 1);
      equal(player.combinations.length, 0);

      const taken = table.takeCombinationFromBulkOfPlayer(comb, player);
      equal(taken, null);
      equal(bulkOfPlayer?.cards.length, 1);
      equal(player.combinations.length, 0);
      equal(table.discardPile.length, 0);
    });

    it(`takes a combination from fake (null) player's bulk, if called with null as player and no destination given,
        adds it to discardPile, and returns it`, () => {
      const { deck } = getDnP();
      const table = new Table(deck);
      const bulkOfPlayer = table.getBulkOfPlayer(null);
      const comb = deck.allCards.slice(0, 3);
      bulkOfPlayer?.cards.push(comb);
      equal(bulkOfPlayer?.cards.length, 1);

      const taken = table.takeCombinationFromBulkOfPlayer(comb, null);
      equal(taken, comb);
      equal(bulkOfPlayer?.cards.length, 0);
      equal(table.discardPile.length, 3);
    });
  });

  describe(`[revokeAllCardsFromBulkOfPlayer]`, () => {
    it(`revokes all cards to player's own cards and combinations, returns true`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      const bulkOfPlayer = table.getBulkOfPlayer(player);

      const [c1, c2, c3, c4, c5] = deck.allCards;
      const comb = [c2, c3, c4, c5];
      table.addCardToBulkOfPlayer(c1, player);
      table.addCombinationToBulkOfPlayer(comb, player);
      equal(bulkOfPlayer?.cards.length, 2);
      equal(bulkOfPlayer?.cards[0], c1);
      const addedComb = bulkOfPlayer?.cards[1] as Card[];
      equal(addedComb.length, 4);

      // prettier-ignore
      const revoked = table.revokeAllCardsFromBulkOfPlayer(player, ['ownCards', 'combinations']);
      equal(revoked, true);
      equal(bulkOfPlayer?.cards.length, 0);
    });

    it(`revokes all cards to discardPile if no destination given, returns true`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      const bulkOfPlayer = table.getBulkOfPlayer(player);

      const [c1, c2, c3, c4, c5] = deck.allCards;
      const comb = [c2, c3, c4, c5];
      table.addCardToBulkOfPlayer(c1, player);
      table.addCombinationToBulkOfPlayer(comb, player);
      equal(bulkOfPlayer?.cards.length, 2);
      equal(bulkOfPlayer?.cards[0], c1);
      const addedComb = bulkOfPlayer?.cards[1] as Card[];
      equal(addedComb.length, 4);

      // prettier-ignore
      const revoked = table.revokeAllCardsFromBulkOfPlayer(player);
      equal(revoked, true);
      equal(bulkOfPlayer?.cards.length, 0);
      equal(table.discardPile.length, 5);
    });

    it(`revokes all cards to player's own cards, combinations - to discardPile, returns true`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      const bulkOfPlayer = table.getBulkOfPlayer(player);

      const [c1, c2, c3, c4, c5] = deck.allCards;
      const comb = [c2, c3, c4, c5];
      table.addCardToBulkOfPlayer(c1, player);
      table.addCombinationToBulkOfPlayer(comb, player);
      equal(bulkOfPlayer?.cards.length, 2);
      equal(bulkOfPlayer?.cards[0], c1);
      const addedComb = bulkOfPlayer?.cards[1] as Card[];
      equal(addedComb.length, 4);

      // prettier-ignore
      const revoked = table.revokeAllCardsFromBulkOfPlayer(player, ['ownCards']);
      equal(revoked, true);
      equal(bulkOfPlayer?.cards.length, 0);
      equal(player.ownCards.length, 1);
      equal(table.discardPile.length, 4);
    });
  });

  describe(`[revokeAllCardsFromPlayersBulks]`, () => {
    it(`revokes all cards from all playersBulks to players' own cards and combinations,
        or to discardPile if player is null, returns true`, () => {
      const { deck, player } = getDnP();
      const table = new Table(deck, [player]);
      const bulkOfNullPlayer = table.getBulkOfPlayer(null);
      const bulkOfPlayer = table.getBulkOfPlayer(player);

      const [c1, c2, c3, c4, c5, c6, c7] = deck.allCards;
      const comb1 = [c3, c4];
      const comb2 = [c5, c6, c7];
      table.addCardToBulkOfPlayer(c1, null);
      table.addCardToBulkOfPlayer(c2, player);
      table.addCombinationToBulkOfPlayer(comb1, null);
      table.addCombinationToBulkOfPlayer(comb2, player);

      equal(bulkOfNullPlayer?.cards.length, 2);
      equal(bulkOfPlayer?.cards.length, 2);
      equal(bulkOfNullPlayer?.cards[0], c1);
      equal(bulkOfPlayer?.cards[0], c2);
      const addedComb1 = bulkOfNullPlayer?.cards[1] as Card[];
      const addedComb2 = bulkOfPlayer?.cards[1] as Card[];
      equal(addedComb1.length, 2);
      equal(addedComb2.length, 3);

      // prettier-ignore
      const revoked = table.revokeAllCardsFromPlayersBulks(['ownCards', 'combinations']);
      equal(revoked, true);
      equal(bulkOfNullPlayer?.cards.length, 0);
      equal(bulkOfPlayer?.cards.length, 0);
      equal(player.ownCards.length, 1);
      equal(player.combinations.length, 1);
      equal(player.combinations[0].length, 3);
    });

    it(`revokes all cards from all playersBulks to players' own cards, but their combinations
        and cards and combinations of null player - to discardPile, returns true`, () => {
      const { deck, player } = getDnP();
      const player2 = new Player(deck);
      const table = new Table(deck, [player, player2]);

      const bulkOfNullPlayer = table.getBulkOfPlayer(null);
      const bulkOfPlayer = table.getBulkOfPlayer(player);
      const bulkOfPlayer2 = table.getBulkOfPlayer(player2);

      const [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10] = deck.allCards;
      const comb1 = [c4, c5];
      const comb2 = [c6, c7];
      const comb3 = [c8, c9, c10];
      table.addCardToBulkOfPlayer(c1, null);
      table.addCardToBulkOfPlayer(c2, player);
      table.addCardToBulkOfPlayer(c3, player2);
      table.addCombinationToBulkOfPlayer(comb1, null);
      table.addCombinationToBulkOfPlayer(comb2, player);
      table.addCombinationToBulkOfPlayer(comb3, player2);

      equal(bulkOfNullPlayer?.cards.length, 2);
      equal(bulkOfPlayer?.cards.length, 2);
      equal(bulkOfPlayer2?.cards.length, 2);
      equal(bulkOfNullPlayer?.cards[0], c1);
      equal(bulkOfPlayer?.cards[0], c2);
      equal(bulkOfPlayer2?.cards[0], c3);
      const addedComb1 = bulkOfNullPlayer?.cards[1] as Card[];
      const addedComb2 = bulkOfPlayer?.cards[1] as Card[];
      const addedComb3 = bulkOfPlayer2?.cards[1] as Card[];
      equal(addedComb2.length, 2);
      equal(addedComb1.length, 2);
      equal(addedComb3.length, 3);

      const revoked = table.revokeAllCardsFromPlayersBulks(['ownCards']);
      equal(revoked, true);
      equal(bulkOfNullPlayer?.cards.length, 0);
      equal(bulkOfPlayer?.cards.length, 0);
      equal(bulkOfPlayer2?.cards.length, 0);
      equal(player.ownCards.length, 1);
      equal(player.ownCards[0], c2);
      equal(player.combinations.length, 0);
      equal(player2.ownCards.length, 1);
      equal(player2.ownCards[0], c3);
      equal(player2.combinations.length, 0);

      equal(table.discardPile.length, 8); // c1 + comb1(2) + comb2(2) + comb3(3)
    });
  });
});
