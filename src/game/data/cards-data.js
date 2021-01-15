export const defaultSuitNames = ['spades', 'hearts', 'diamonds', 'clubs'];

export const defaultSuitData = [
  // name, value, rank
  ['ace', 14, 13],
  ['king', 13, 12],
  ['queen', 12, 11],
  ['jack', 11, 10],
  ['ten', 10, 9],
  ['nine', 9, 8],
  ['eight', 8, 7],
  ['seven', 7, 6],
  ['six', 6, 5],
  ['five', 5, 4],
  ['four', 4, 3],
  ['three', 3, 2],
  ['two', 2, 1],
];

export const defaultTrumpSuitData = defaultSuitData.map(d => d.map(s => s));

export const defaultDebertsSuitData = [
  ['ace', 11, 8],
  ['ten', 10, 7],
  ['king', 4, 6],
  ['queen', 3, 5],
  ['jack', 2, 4],
  ['nine', 0, 3],
  ['eight', 0, 2],
  ['seven', 0, 1],
];

export const defaultDebertsTrumpSuitData = [
  ['jack', 20, 8],
  ['nine', 14, 7],
  ['ace', 11, 6],
  ['ten', 10, 5],
  ['king', 4, 4],
  ['queen', 3, 3],
  ['eight', 0, 2],
  ['seven', 0, 1],
];
