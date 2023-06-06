import { strictEqual as equal, throws } from 'assert';
import deckCardsData from '../../src/data/deck-cards-data';
import Deck from '../../src/inventory/deck';
import Table from '../../src/inventory/table';
import Player from '../../src/actors/player';
import Dealer, { DealingConfig } from '../../src/actors/dealer';

describe(`Dealer`, () => {
  describe(`new Dealer not created with invalid table`, () => {
    it(`throws if not table was given`, () => {
      const dealingConfig: DealingConfig = {
        playersQty: 2,
        cardsQtyToPlayer: 6,
      };
      // @ts-expect-error: first argument must be table
      throws(() => new Dealer(null, dealingConfig));
    });
  });

  describe(`Dealer deals cards`, () => {
    it(`deals cards according to dealingConfig`, () => {
      const deck = new Deck(deckCardsData);
      const player1 = new Player(deck);
      const player2 = new Player(deck);
      const table = new Table(deck, [player1, player2]);

      const dealingConfig: DealingConfig = {
        playersQty: 2,
        cardsQtyToPlayer: 6,
        buyInCardsQty: 3,
      };

      const dealer = new Dealer(table, dealingConfig);

      dealer.deal();

      equal(player1.ownCards.length, 6);
      equal(table.playersCorners[0].buyInCards.length, 3);
      equal(player2.ownCards.length, 6);
      equal(table.playersCorners[1].buyInCards.length, 3);
    });
  });
});
