import Deck from '../inventory/deck';
import Card from '../inventory/card';
import Player from '../actors/player';

export default class Table {
  deck: Deck;
  playersCorners: { player: Player; cards: Card[]; buyInCards: Card[] }[];
  beatArea: { player: Player; cards: Card[] }[];
  heap: { player: Player; cards: Card[][] }[];
  trumpCardCell: Card | null;

  constructor(deck: Deck, players: Player[]) {
    if (!(deck instanceof Deck)) {
      throw new Error('deck must be instance of Deck when creating new Table.');
    }

    const validPlayers = players.every(p => p instanceof Player);
    if (!validPlayers) {
      throw new Error('Each player must be Player when creating new Table.');
    }

    this.deck = deck;
    this.playersCorners = players.map(p => ({
      player: p,
      cards: [],
      buyInCards: [],
    }));
    this.beatArea = [];
    this.heap = [];
    this.trumpCardCell = null;
  }
}
