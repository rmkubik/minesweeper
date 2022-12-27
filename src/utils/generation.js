import {
  getLocation,
  updateMatrix,
  constructMatrix,
  floodFill,
  getNeighbors,
  getCrossDirections,
  getAllDirections,
  mapMatrix,
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
  isTileEmpty,
  isTileInfected,
} from "./index";

function lockTiles(tiles, quantity) {
  const locations = times(() => getRandomLocation(tiles), quantity);

  let newTiles = clone(tiles);
  locations.forEach((location) => {
    const tile = getLocation(tiles, location);

    newTiles = updateMatrix(location, { ...tile, locked: true }, newTiles);
  });

  return newTiles;
}

function infectTiles(tiles, quantity) {
  const locations = times(() => getRandomLocation(tiles), quantity);

  let newTiles = clone(tiles);
  locations.forEach((location) => {
    const tile = getLocation(tiles, location);

    newTiles = updateMatrix(location, { ...tile, infected: true }, newTiles);
  });

  return newTiles;
}

const pickTile = (map) => {
  const choices = new WeightedMap(map);

  return choices.pickRandom();
};

const countPositiveNeighbors = (tile, location, tiles) => {
  const neighbors = getNeighbors(getAllDirections, tiles, location);

  const positiveNeighborCount = neighbors.reduce((count, neighborLocation) => {
    const neighbor = getLocation(tiles, neighborLocation);

    if (isTilePositive(neighbor)) {
      return count + 1;
    }

    return count;
  }, 0);

  return positiveNeighborCount;
};

const countDangerousNeighbors = (tile, location, tiles) => {
  const neighbors = getNeighbors(getAllDirections, tiles, location);

  const dangerousNeighborCount = neighbors.reduce((count, neighborLocation) => {
    const neighbor = getLocation(tiles, neighborLocation);

    if (isTileDangerous(neighbor)) {
      return count + 1;
    }

    return count;
  }, 0);

  return dangerousNeighborCount;
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
    (tile) =>
      !isTileInfected(tile) &&
      !isTileLocked(tile) &&
      (isTileEmpty(tile) || isTileHouse(tile)),
    // anyPass([isTileEmpty, isTilePositive]),
    tiles,
    [location],
    [],
    []
  );

  // reveal clicked tiles
  let newTiles = updateMatrix(location, { ...tile, revealed: true }, tiles);

  // reveal all connected empty tiles
  connectedEmptyLocations.forEach((emptyLocation) => {
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
  const LEVEL_MAPS = {
    0: {
      [tileTypes.BOMB]: 20,
      [tileTypes.GOLD]: 20,
      [tileTypes.HEART]: 2,
      [tileTypes.EMPTY]: 58,
    },
    1: {
      [tileTypes.BOMB]: 20,
      [tileTypes.GOLD]: 20,
      [tileTypes.HEART]: 2,
      [tileTypes.EMPTY]: 58,
    },
    2: {
      [tileTypes.BOMB]: 20,
      [tileTypes.GOLD]: 10,
      [tileTypes.SOAP]: 10,
      [tileTypes.HEART]: 2,
      [tileTypes.EMPTY]: 58,
    },
  };

  let startingLocation;

  return pipe(
    // generate base tiles
    constructMatrix(() => {
      return {
        icon: pickTile(LEVEL_MAPS[level] || LEVEL_MAPS[0]),
        revealed: false,
      };
    }),
    (tiles) => {
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
    (tiles) => placeTile(tiles, dimensions, tileTypes.TELESCOPE),
    // place exit
    (tiles) => placeTile(tiles, dimensions, tileTypes.DOOR),
    // place locks
    (tiles) => {
      if (level !== 1) {
        // only lock tiles on level 1
        return tiles;
      }

      return lockTiles(tiles, 10);
    },
    // place key
    (tiles) => {
      if (level !== 1) {
        // only lock tiles on level 1
        return tiles;
      }

      return placeTile(tiles, dimensions, tileTypes.KEY);
    },
    (tiles) => {
      if (level !== 2) {
        // only place germs on level 2
        return tiles;
      }

      return infectTiles(tiles, 20);
    },
    (tiles) => {
      if (level !== 2) {
        // only place microscope on level 2
        return tiles;
      }

      return placeTile(tiles, dimensions, tileTypes.MICROSCOPE);
    },
    // count tile marking numbers
    mapMatrix((tile, location, tiles) => {
      if (!isTileEmpty(tile)) {
        return tile;
      }

      const neighborIconCounts = countNeighboringIcons(tile, location, tiles);
      const positiveNeighbors = countPositiveNeighbors(tile, location, tiles);
      const dangerousNeighbors = countDangerousNeighbors(tile, location, tiles);

      if (positiveNeighbors + dangerousNeighbors === 0) {
        return {
          ...tile,
          icon: tileTypes.EMPTY,
        };
      }

      return {
        ...tile,
        icon: "" + neighborIconCounts,
        neighbors: {
          positive: positiveNeighbors,
          dangerous: dangerousNeighbors,
        },
      };
    }),
    // reveal starting tile and connencted tiles
    (tiles) => revealConnectedTiles(tiles, startingLocation)
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
