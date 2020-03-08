import WeightedMap from "./WeightedMap";

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

export * from "./tiles";
export { randIntBetween, getRandomLocation, WeightedMap };
