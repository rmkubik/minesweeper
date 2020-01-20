import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import styled, { createGlobalStyle } from "styled-components";
import {
  fillMatrix,
  mapMatrix,
  updateMatrix,
  getLocation,
  constructMatrix,
  floodFill,
  getNeighbors,
  getCrossDirections,
  getAllDirections
} from "functional-game-utils";

const MapContainer = styled.div`
  display: grid;
  grid-template-columns: ${({ tileSize, width }) =>
    `${tileSize}px `.repeat(width)};

  span {
    width: ${({ tileSize }) => tileSize}px;
    height: ${({ tileSize }) => tileSize}px;
    line-height: ${({ tileSize }) => tileSize}px;
  }
`;

const TILES_WIDE = 15;
const TILES_HIGH = 15;

const DOOR = "🚪";
const BOMB = "💣";
const GOLD = "💰";
const EMPTY = "";
const FLAG = "🚩";

const Map = ({ tiles, revealTile, markTile }) => {
  return (
    <MapContainer tileSize={32} width={TILES_WIDE}>
      {mapMatrix(
        (tile, location) => (
          <Tile
            key={location.row * 10 + location.col}
            revealTile={revealTile}
            location={location}
            markTile={markTile}
            {...tile}
          />
        ),
        tiles
      )}
    </MapContainer>
  );
};

const TileContainer = styled.span`
  border: black solid 2px;
  text-align: center;

  &:hover {
    background-color: ${({ revealed }) => (revealed ? "" : "gainsboro")};
  }

  &:active {
    background-color: gainsboro;
    border-top-color: gray;
    border-left-color: gray;
    border-bottom-color: aliceblue;
    border-right-color: aliceblue;
  }

  ${({ revealed }) =>
    revealed
      ? `
        background-color: aliceblue;
        border-top-color: lightgray;
        border-left-color: lightgray;
        border-bottom-color: lightgray;
        border-right-color: lightgray;
        `
      : `
        background-color: lightgray;
        border-top-color: aliceblue;
        border-left-color: aliceblue;
        border-bottom-color: gray;
        border-right-color: gray;
        `}
`;

const Tile = ({ icon, revealed, revealTile, location, flagged, markTile }) => {
  let displayIcon = "";

  if (flagged) {
    displayIcon = FLAG;
  }

  if (revealed) {
    displayIcon = icon;
  }

  return (
    <TileContainer
      revealed={revealed}
      onClick={event => {
        revealTile(location);
      }}
      onContextMenu={event => {
        event.preventDefault();
        markTile(location);
      }}
    >
      {displayIcon}
    </TileContainer>
  );
};

const GlobalStyle = createGlobalStyle`
  body {
    color: ${props => (props.whiteColor ? "white" : "black")};
    font-family: Helvetica, Arial, sans-serif;
  }
`;

function isTileEmpty(tile) {
  return tile.icon !== BOMB && tile.icon !== GOLD && tile.icon !== DOOR;
}

function isTileDangerous(tile) {
  return tile.icon === BOMB;
}

const pickTile = () => {
  const choice = Math.floor(Math.random() * 100);

  if (choice < 20) {
    return BOMB;
  }

  if (choice < 40) {
    return GOLD;
  }

  return EMPTY;
};

const countNeighboringIcons = (tile, location, tiles) => {
  const neighbors = getNeighbors(getAllDirections, tiles, location);

  const neighborIconCounts = neighbors.reduce((count, neighborLocation) => {
    const neighbor = getLocation(tiles, neighborLocation);

    if (isTileDangerous(neighbor)) {
      return count + 1;
    }

    return count;
  }, 0);

  return neighborIconCounts;
};

const placeDoor = tiles => {
  const row = Math.floor(Math.random() * TILES_HIGH);
  const col = Math.floor(Math.random() * TILES_WIDE);

  return updateMatrix({ row, col }, { icon: DOOR, revealed: false }, tiles);
};

const App = () => {
  const [tiles, setTiles] = useState([]);
  const [gold, setGold] = useState(0);
  const [lives, setLives] = useState(3);
  const [foundDoor, setFoundDoor] = useState(false);

  useEffect(() => {
    const generatedTiles = constructMatrix(
      () => {
        return { icon: pickTile(), revealed: false };
      },
      { width: TILES_WIDE, height: TILES_HIGH }
    );

    const doorPlacedTiles = placeDoor(generatedTiles);

    const numbersAddedTiles = mapMatrix((tile, location, tiles) => {
      if (!isTileEmpty(tile)) {
        return tile;
      }

      const neighborIconCounts = countNeighboringIcons(tile, location, tiles);

      if (neighborIconCounts === 0) {
        return {
          ...tile,
          icon: ""
        };
      }

      return {
        ...tile,
        icon: "" + neighborIconCounts
      };
    }, doorPlacedTiles);

    setTiles(numbersAddedTiles);
  }, []);

  const revealTile = location => {
    const tile = getLocation(tiles, location);

    switch (tile.icon) {
      case GOLD:
        setGold(gold + 1);
        break;
      case BOMB:
        setLives(lives - 1);
        break;
      case DOOR:
        setFoundDoor(true);
        break;
    }

    const connectedEmptyLocations = floodFill(
      getNeighbors(getCrossDirections),
      isTileEmpty,
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

    setTiles(newTiles);
  };

  const markTile = location => {
    const tile = getLocation(tiles, location);

    setTiles(updateMatrix(location, { ...tile, flagged: true }, tiles));
  };

  return (
    <>
      <GlobalStyle />
      <Map tiles={tiles} revealTile={revealTile} markTile={markTile} />
      <p>Gold: {gold}</p>
      <p>Lives: {lives}</p>
      <p>{foundDoor ? "You found the exit!" : ""}</p>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
