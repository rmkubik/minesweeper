import { curry, flatten } from "ramda";
import WeightedMap from "./WeightedMap";
import { mapMatrix, getLocation } from "functional-game-utils";

function pickRandomlyFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randIntBetween(low, high) {
  return Math.floor(Math.random() * (high - low)) + low;
}

function getRandomLocation(matrix) {
  const maxRow = matrix.length;
  const maxCol = matrix[0].length;

  return {
    row: randIntBetween(0, maxRow),
    col: randIntBetween(0, maxCol)
  };
}

const getMatchingLocations = curry((filter, matrix) => {
  const locationMatrix = mapMatrix((tile, location, tiles) => location, matrix);

  const filteredMatrix = locationMatrix.map(array =>
    array.filter(location =>
      filter(getLocation(matrix, location), location, matrix)
    )
  );

  return flatten(filteredMatrix);
});

export * from "./generation";
export * from "./tiles";
export {
  randIntBetween,
  getRandomLocation,
  WeightedMap,
  getMatchingLocations,
  pickRandomlyFromArray
};
