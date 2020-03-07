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
  getAllDirections,
  isLocationInBounds,
  compareLocations
} from "functional-game-utils";
import { anyPass } from "ramda";

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
const HEART = "♥️";
const COMPASS = "🧭";
const MAP = "🗺️";
const TELESCOPE = "🔭";
const HOME = "🏠";

function isTileEmpty(tile) {
  return (
    tile.icon !== BOMB &&
    tile.icon !== GOLD &&
    tile.icon !== DOOR &&
    tile.icon !== HOME &&
    tile.icon !== HEART
  );
}

function isTileDangerous(tile) {
  return tile.icon === BOMB;
}

function isTilePositive(tile) {
  return tile.icon === GOLD || tile.icon === DOOR || tile.icon === HEART;
}

function isTileHouse(tile) {
  return tile.icon === HOME;
}

const Map = ({ tiles, revealTile, markTile, hoverTile, hovered }) => {
  let hoveredNeighbors = [];

  if (isLocationInBounds(tiles, hovered)) {
    hoveredNeighbors = getNeighbors(getAllDirections, tiles, hovered);
  }

  return (
    <MapContainer tileSize={32} width={TILES_WIDE}>
      {mapMatrix(
        (tile, location) => (
          <Tile
            key={location.row * 10 + location.col}
            revealTile={revealTile}
            location={location}
            markTile={markTile}
            hoverTile={hoverTile}
            hovered={hoveredNeighbors.some(hoveredLocation =>
              compareLocations(hoveredLocation, location)
            )}
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
  font-family: "Segoe UI Symbol";

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
        border-top-color: lightgray;
        border-left-color: lightgray;
        border-bottom-color: lightgray;
        border-right-color: lightgray;
        `
      : `
        border-top-color: aliceblue;
        border-left-color: aliceblue;
        border-bottom-color: gray;
        border-right-color: gray;
        `}

  ${({ revealed, hovered, flagged, getTileValue }) => {
    if (!revealed && !flagged) {
      return "background-color: lightgray;";
    }

    if (!hovered) {
      if (revealed) {
        return "background-color: aliceblue;";
      } else {
        return "background-color: lightgray;";
      }
    }

    if (flagged) {
      return "background-color: #ffcbcb;";
    }

    if (getTileValue() > 0) {
      return "background-color: #d0ffcb;";
    } else if (getTileValue() < 0) {
      return "background-color: #ffcbcb;";
    } else {
      return "background-color: aliceblue;";
    }
  }}
`;

const Tile = ({
  icon,
  revealed,
  revealTile,
  location,
  flagged,
  markTile,
  hoverTile,
  hovered
}) => {
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
      hovered={hovered}
      getTileValue={() => {
        if (isTilePositive({ icon })) {
          return 1;
        } else if (isTileDangerous({ icon })) {
          return -1;
        } else {
          return 0;
        }
      }}
      flagged={flagged}
      onClick={event => {
        revealTile(location);
      }}
      onContextMenu={event => {
        event.preventDefault();
        markTile(location);
      }}
      onMouseOver={event => {
        hoverTile(location);
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

const pickTile = () => {
  const choice = Math.floor(Math.random() * 100);

  if (choice < 20) {
    return BOMB;
  }

  if (choice < 40) {
    return GOLD;
  }

  if (choice < 46) {
    return HEART;
  }

  return EMPTY;
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

  return updateMatrix({ row, col }, { icon: DOOR, revealed: false }, tiles);
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

    setTiles(newTiles);
  };

  const markTile = location => {
    const tile = getLocation(tiles, location);

    setTiles(updateMatrix(location, { ...tile, flagged: true }, tiles));
  };

  const handleClick = location => {
    const tile = getLocation(tiles, location);

    switch (tile.icon) {
      case GOLD:
        setGold(gold + 1);
        break;
      case BOMB:
        setLives(lives - 1);
        break;
      case HEART:
        setLives(lives + 1);
        break;
      case DOOR:
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
      { ...startingTile, icon: HOME },
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
          icon: EMPTY
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
      />
      <p>Gold: {gold}</p>
      <p>Lives: {lives}</p>
      <p>{foundDoor ? "You found the exit!" : ""}</p>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
