import { strictEqual as equal } from 'assert';
import areAllValsInTarget from '../../../src/lib/utils/are-all-vals-in-target';

describe(`areAllValsInTarget`, () => {
  it(`detects that all values absent in target array and returns true`, () => {
    const arr = [21, 25, 29];
    const target = [36, 98, 'f', 0, 1, 159];
    equal(areAllValsInTarget('absent', arr, target), true);
  });

  it(`detects that not all values absent in target array and returns false`, () => {
    const arr = [21, 25, 29];
    const target = [36, 98, 'f', 0, 1, 25, 159];
    equal(areAllValsInTarget('absent', arr, target), false);
  });

  it(`detects that all values present in target array and returns true`, () => {
    const arr = [21, 25, 29];
    const target = [361, 9.8, 29, 'f', 0, 25, 21, 159];
    equal(areAllValsInTarget('present', arr, target), true);
  });

  it(`detects that not all values present in target array and returns false`, () => {
    const arr = [21, 25, 29];
    const target = [361, 9.8, 2, 'f', 0, 25, 21, 159];
    equal(areAllValsInTarget('present', arr, target), false);
  });
});
