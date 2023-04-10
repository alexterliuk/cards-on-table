import Player from './actors/player';
import Card from './inventory/card';
import Deck from './inventory/deck';
import Suit from './inventory/suit';
import Table from './inventory/table';
import deckCardsData from './data/deck-cards-data';

const deck = new Deck(deckCardsData);
const p1 = new Player(deck);
const p2 = new Player(deck);
const p3 = new Player(deck);
const p4 = new Player(deck);

class CardsOnTable {
  name: string;
  description: string;
  _player: typeof Player;
  _card: typeof Card;
  _deck: typeof Deck;
  _suit: typeof Suit;
  _table: typeof Table;
  players: Array<Player>;
  deck: Deck;
  table: Table;

  constructor() {
    this.name = 'Cards On Table';
    this.description =
      'The library for the construction of playing cards game.';
    this._player = Player;
    this._card = Card;
    this._deck = Deck;
    this._suit = Suit;
    this._table = Table;
    this.players = [p1, p2, p3, p4];
    this.deck = deck;
    this.table = new Table(this.deck, this.players);
  }
}

const cds = new CardsOnTable();

export default cds;
