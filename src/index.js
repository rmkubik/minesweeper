import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { createGlobalStyle } from "styled-components";
import {
  mapMatrix,
  updateMatrix,
  getLocation,
  constructMatrix,
  floodFill,
  getNeighbors,
  getCrossDirections,
  getAllDirections
} from "functional-game-utils";
import {
  tileTypes,
  getRandomLocation,
  WeightedMap,
  isTileEmpty,
  isTileDangerous,
  isTileHouse,
  isTilePositive
} from "./utils/index";
import Map from "./components/Map";

const TILES_WIDE = 15;
const TILES_HIGH = 15;

const GlobalStyle = createGlobalStyle`
  body {
    color: ${props => (props.whiteColor ? "white" : "black")};
    font-family: Helvetica, Arial, sans-serif;
  }
`;

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

const placeDoor = tiles => {
  const row = Math.floor(Math.random() * TILES_HIGH);
  const col = Math.floor(Math.random() * TILES_WIDE);

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

const App = () => {
  const [tiles, setTiles] = useState([]);
  const [gold, setGold] = useState(0);
  const [lives, setLives] = useState(3);
  const [foundDoor, setFoundDoor] = useState(false);
  const [hovered, setHovered] = useState({});

  const revealTile = location => {
    const newTiles = revealConnectedTiles(tiles, location);
    const tile = getLocation(newTiles, location);
    const unFlaggedTiles = updateMatrix(
      location,
      { ...tile, flagged: false },
      newTiles
    );

    setTiles(unFlaggedTiles);
  };

  const markTile = (location, marked) => {
    const tile = getLocation(tiles, location);

    setTiles(updateMatrix(location, { ...tile, flagged: marked }, tiles));
  };

  const handleClick = location => {
    const tile = getLocation(tiles, location);

    switch (tile.icon) {
      case tileTypes.GOLD:
        setGold(gold + 1);
        break;
      case tileTypes.BOMB:
        setLives(lives - 1);
        break;
      case tileTypes.HEART:
        setLives(lives + 1);
        break;
      case tileTypes.DOOR:
        setFoundDoor(true);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const generatedTiles = constructMatrix(
      () => {
        return { icon: pickTile(), revealed: false };
      },
      { width: TILES_WIDE, height: TILES_HIGH }
    );

    // pick starting tile
    const startingLocation = getRandomLocation(generatedTiles);
    const startingTile = getLocation(generatedTiles, startingLocation);
    const startingTilePickedTiles = updateMatrix(
      startingLocation,
      { ...startingTile, icon: tileTypes.HOME },
      generatedTiles
    );

    // place exit
    const doorPlacedTiles = placeDoor(startingTilePickedTiles);

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

    // set default tiles
    setTiles(revealedTiles);
  }, []);

  return (
    <>
      <GlobalStyle />
      <Map
        tiles={tiles}
        revealTile={location => {
          handleClick(location);
          revealTile(location);
        }}
        markTile={markTile}
        hoverTile={location => setHovered(location)}
        hovered={hovered}
        width={TILES_WIDE}
        height={TILES_HIGH}
      />
      <p>Gold: {gold}</p>
      <p>Lives: {lives}</p>
      <p>{foundDoor ? "You found the exit!" : ""}</p>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
