import Deck from '../inventory/deck';
import Card from '../inventory/card';
import Player from '../actors/player';
import findIndexOfMatchedArray from '../lib/find-index-of-matched-array';

export default class Table {
  deck: Deck;
  playersCorners: { player: Player; cards: Card[]; buyInCards: Card[] }[];
  playersBulks: { player: Player | null; cards: (Card | Card[])[] }[];
  beatArea: { player: Player; cards: Card[] }[];
  trumpCardCell: Card | null;
  discardPile: Card[];

  constructor(deck: Deck, players: Player[]) {
    if (!(deck instanceof Deck)) {
      throw new Error('deck must be instance of Deck when creating new Table.');
    }

    const validPlayers = players.every(p => p instanceof Player);
    if (!validPlayers) {
      throw new Error('Each player must be Player when creating new Table.');
    }

    players.forEach(p => p.connectToTable(this));

    this.deck = deck;
    this.playersCorners = players.map(p => ({
      player: p,
      cards: [],
      buyInCards: [],
    }));
    this.playersBulks = [
      // null bulk will get non-related to actual players cards if any
      { player: null, cards: [] },
      ...players.map(p => ({ player: p, cards: [] })),
    ];
    this.beatArea = [];
    this.trumpCardCell = null;
    this.discardPile = [];
  }

  addCardToDiscardPile(card: Card) {
    if (!this.discardPile.includes(card)) {
      this.discardPile.push(card);
      return true;
    }
    return false;
  }

  addCombinationToDiscardPile(combination: Card[]) {
    const allCardsAbsentInDiscardPile = this.discardPile.every(
      c => !combination.includes(c)
    );
    if (!allCardsAbsentInDiscardPile) return false;

    this.discardPile = this.discardPile.concat(combination);
    return true;
  }

  getAllCardsFromPlayersBulks() {
    return this.playersBulks.map(p => p.cards).flat(2);
  }

  getBulkOfPlayer(player: Player | null) {
    return this.playersBulks.find(bulk => bulk.player === player);
  }

  addCardOrCombinationToBulkOfPlayer(
    data: Card | Card[],
    player: Player | null
  ) {
    const bulkOfPlayer = this.getBulkOfPlayer(player);
    if (bulkOfPlayer) {
      bulkOfPlayer.cards.push(data);
      return true;
    }
    return false;
  }

  addCardToBulkOfPlayer(card: Card, player: Player | null) {
    if (this.getAllCardsFromPlayersBulks().includes(card)) return false;
    return this.addCardOrCombinationToBulkOfPlayer(card, player);
  }

  addCombinationToBulkOfPlayer(combination: Card[], player: Player | null) {
    const allCardsAbsentInPlayersBulks = this.getAllCardsFromPlayersBulks().every(
      c => !combination.includes(c)
    );
    if (!allCardsAbsentInPlayersBulks) return false;
    return this.addCardOrCombinationToBulkOfPlayer(combination, player);
  }

  // this method calls player's method
  takeCardFromBulkOfPlayer(
    card: Card,
    player: Player | null,
    destination?: 'ownCards' | 'discardPile'
  ): Card | null {
    if (!this.getAllCardsFromPlayersBulks().includes(card)) return null;
    const bulkOfPlayer = this.getBulkOfPlayer(player);
    if (bulkOfPlayer) {
      const cards = bulkOfPlayer.cards;
      const idx = cards.findIndex(c => c === card);
      if (idx > -1) {
        if (bulkOfPlayer.player === null || destination === 'discardPile') {
          const added = this.addCardToDiscardPile(card);
          return added ? (cards.splice(idx, 1)[0] as Card) : null;
        }
        if (destination === 'ownCards') {
          const added = player?.addCardToOwnCards(card);
          return added ? (cards.splice(idx, 1)[0] as Card) : null;
        }
      }
    }
    return null;
  }

  // this method calls player's method
  takeCombinationFromBulkOfPlayer(
    combination: Card[],
    player: Player | null,
    destination?: 'combinations' | 'discardPile'
  ): Card[] | null {
    const bulkOfPlayer = this.getBulkOfPlayer(player);
    if (bulkOfPlayer) {
      const cards = bulkOfPlayer.cards;
      const idx = findIndexOfMatchedArray(cards, combination);
      if (idx > -1) {
        if (bulkOfPlayer.player === null || destination === 'discardPile') {
          const added = this.addCombinationToDiscardPile(combination);
          return added ? (cards.splice(idx, 1)[0] as Card[]) : null;
        }
        if (destination === 'combinations') {
          // prettier-ignore
          const added = player?.addCombinationToCombinations(combination);
          return added ? (cards.splice(idx, 1)[0] as Card[]) : null;
        }
      }
    }
    return null;
  }

  revokeAllCardsFromBulkOfPlayer(
    player: Player | null,
    destination: ('ownCards' | 'combinations')[] = []
  ): boolean {
    const bulkOfPlayer = this.getBulkOfPlayer(player);
    if (bulkOfPlayer) {
      const dest = destination;
      const toOwnCards = dest.includes('ownCards') && 'ownCards';
      const toCombinations = dest.includes('combinations') && 'combinations';
      const cards: Card[] = [];
      const combinations: Card[][] = [];
      bulkOfPlayer.cards.forEach(cardOrComb => {
        Array.isArray(cardOrComb)
          ? combinations.push(cardOrComb)
          : cards.push(cardOrComb);
      });

      cards.forEach(c => {
        this.takeCardFromBulkOfPlayer(c, player, toOwnCards || undefined);
      });
      // prettier-ignore
      combinations.forEach(c => {
        this.takeCombinationFromBulkOfPlayer(c, player, toCombinations || undefined);
      });

      return !!bulkOfPlayer.cards.length;
    }
    return false;
  }

  revokeAllCardsFromPlayersBulks(
    destination: ('ownCards' | 'combinations')[] = []
  ): boolean {
    const nullPlayerResult = this.playersBulks[0].cards.filter(c => {
      const added =
        c instanceof Card
          ? this.addCardToDiscardPile(c)
          : this.addCombinationToDiscardPile(c);
      return !added;
    });
    this.playersBulks[0].cards = nullPlayerResult;

    const result = this.playersBulks
      .slice(1)
      .map(b =>
        this.revokeAllCardsFromBulkOfPlayer(b.player as Player, destination)
      );

    return !nullPlayerResult.length && result.every(r => r);
  }
}
