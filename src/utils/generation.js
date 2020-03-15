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
import { clone, times, pipe } from "ramda";
import {
  tileTypes,
  isTileDangerous,
  isTilePositive,
  isTileHouse,
  isTileLocked,
  getRandomLocation,
  WeightedMap,
  isTileEmpty
} from "./index";

function lockTiles(tiles, quantity) {
  const locations = times(() => getRandomLocation(tiles), quantity);

  let newTiles = clone(tiles);
  locations.forEach(location => {
    const tile = getLocation(tiles, location);

    newTiles = updateMatrix(location, { ...tile, locked: true }, newTiles);
  });

  return newTiles;
}

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

const placeTile = (tiles, dimensions, icon) => {
  const row = Math.floor(Math.random() * dimensions.height);
  const col = Math.floor(Math.random() * dimensions.width);

  console.log({ row, col });

  return updateMatrix({ row, col }, { icon, revealed: false }, tiles);
};

const revealConnectedTiles = (tiles, location) => {
  const tile = getLocation(tiles, location);

  const connectedEmptyLocations = floodFill(
    getNeighbors(getCrossDirections),
    tile => !isTileLocked(tile) && (isTileEmpty(tile) || isTileHouse(tile)),
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

function generateTiles(dimensions, { level }) {
  let startingLocation;

  return pipe(
    // generate base tiles
    constructMatrix(() => {
      return { icon: pickTile(), revealed: false };
    }),
    tiles => {
      // pick starting tile
      startingLocation = getRandomLocation(tiles);
      const startingTile = getLocation(tiles, startingLocation);

      return updateMatrix(
        startingLocation,
        { ...startingTile, icon: tileTypes.HOME },
        tiles
      );
    },
    // place items
    tiles => placeTile(tiles, dimensions, tileTypes.TELESCOPE),
    // place exit
    tiles => placeTile(tiles, dimensions, tileTypes.DOOR),
    // place locks
    tiles => {
      if (level !== 1) {
        // only lock tiles on level 1
        return tiles;
      }

      return lockTiles(tiles, 10);
    },
    // place key
    tiles => {
      if (level !== 1) {
        // only lock tiles on level 1
        return tiles;
      }

      return placeTile(tiles, dimensions, tileTypes.KEY);
    },
    // count tile marking numbers
    mapMatrix((tile, location, tiles) => {
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
    }),
    // reveal starting tile and connencted tiles
    tiles => revealConnectedTiles(tiles, startingLocation)
  )(dimensions);
}

function revealTile(tiles, location) {
  const newTiles = revealConnectedTiles(tiles, location);
  const tile = getLocation(newTiles, location);
  const unFlaggedTiles = updateMatrix(
    location,
    { ...tile, flagged: false },
    newTiles
  );

  return unFlaggedTiles;
}

export { generateTiles, revealConnectedTiles, revealTile };
