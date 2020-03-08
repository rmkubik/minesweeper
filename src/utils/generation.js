import {
  getLocation,
  updateMatrix,
  constructMatrix,
  floodFill,
  getNeighbors,
  getCrossDirections,
  getAllDirections,
  mapMatrix
} from "functional-game-utils";
import {
  tileTypes,
  isTileDangerous,
  isTilePositive,
  isTileHouse,
  getRandomLocation,
  WeightedMap,
  isTileEmpty
} from "./index";

const pickTile = () => {
  const choices = new WeightedMap({
    [tileTypes.BOMB]: 20,
    [tileTypes.GOLD]: 20,
    [tileTypes.HEART]: 2,
    [tileTypes.EMPTY]: 58
  });

  return choices.pickRandom();
};

const countNeighboringIcons = (tile, location, tiles) => {
  const neighbors = getNeighbors(getAllDirections, tiles, location);

  const neighborIconCounts = neighbors.reduce((count, neighborLocation) => {
    const neighbor = getLocation(tiles, neighborLocation);

    if (isTileDangerous(neighbor)) {
      return count - 1;
    }

    if (isTilePositive(neighbor)) {
      return count + 1;
    }

    return count;
  }, 0);

  return neighborIconCounts;
};

const placeDoor = (tiles, dimensions) => {
  const row = Math.floor(Math.random() * dimensions.height);
  const col = Math.floor(Math.random() * dimensions.width);

  console.log({ row, col });

  return updateMatrix(
    { row, col },
    { icon: tileTypes.DOOR, revealed: false },
    tiles
  );
};

const revealConnectedTiles = (tiles, location) => {
  const tile = getLocation(tiles, location);

  const connectedEmptyLocations = floodFill(
    getNeighbors(getCrossDirections),
    tile => isTileEmpty(tile) || isTileHouse(tile),
    // anyPass([isTileEmpty, isTilePositive]),
    tiles,
    [location],
    [],
    []
  );

  // reveal clicked tiles
  let newTiles = updateMatrix(location, { ...tile, revealed: true }, tiles);

  // reveal all connected empty tiles
  connectedEmptyLocations.forEach(emptyLocation => {
    const emptyTile = getLocation(tiles, emptyLocation);

    newTiles = updateMatrix(
      emptyLocation,
      { ...emptyTile, revealed: true },
      newTiles
    );
  });

  return newTiles;
};

function generateTiles(dimensions) {
  const generatedTiles = constructMatrix(() => {
    return { icon: pickTile(), revealed: false };
  }, dimensions);

  // pick starting tile
  const startingLocation = getRandomLocation(generatedTiles);
  const startingTile = getLocation(generatedTiles, startingLocation);
  const startingTilePickedTiles = updateMatrix(
    startingLocation,
    { ...startingTile, icon: tileTypes.HOME },
    generatedTiles
  );

  // place exit
  const doorPlacedTiles = placeDoor(startingTilePickedTiles, dimensions);

  // count tile marking numbers
  const numbersAddedTiles = mapMatrix((tile, location, tiles) => {
    if (!isTileEmpty(tile)) {
      return tile;
    }

    const neighborIconCounts = countNeighboringIcons(tile, location, tiles);

    if (neighborIconCounts === 0) {
      return {
        ...tile,
        icon: tileTypes.EMPTY
      };
    }

    return {
      ...tile,
      icon: "" + neighborIconCounts
    };
  }, doorPlacedTiles);

  // reveal starting tile and connencted tiles
  const revealedTiles = revealConnectedTiles(
    numbersAddedTiles,
    startingLocation
  );

  return revealedTiles;
}

export { generateTiles, revealConnectedTiles };
