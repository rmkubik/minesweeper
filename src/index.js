import React, { useState } from "react";
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
  getCrossDirections
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

const Map = ({ tiles, revealTile }) => {
  return (
    <MapContainer tileSize={32} width={10}>
      {mapMatrix(
        (tile, location) => (
          <Tile
            key={location.row * 10 + location.col}
            revealTile={revealTile}
            location={location}
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

const Tile = ({ icon, revealed, revealTile, location }) => (
  <TileContainer
    revealed={revealed}
    onClick={() => {
      revealTile(location);
    }}
  >
    {revealed ? icon : ""}
  </TileContainer>
);

const GlobalStyle = createGlobalStyle`
  body {
    color: ${props => (props.whiteColor ? "white" : "black")};
    font-family: Helvetica, Arial, sans-serif;
  }
`;

const door = "🚪";

const pickTile = () => {
  const choice = Math.floor(Math.random() * 100);

  if (choice < 20) {
    return "💣";
  }

  if (choice < 40) {
    return "💰";
  }

  return "";
};

const App = () => {
  const [tiles, setTiles] = useState(
    constructMatrix(
      () => {
        return { icon: pickTile(), revealed: false };
      },
      { width: 10, height: 10 }
    )
  );

  const revealTile = location => {
    const tile = getLocation(tiles, location);

    const connectedEmptyLocations = floodFill(
      getNeighbors(getCrossDirections),
      tile => {
        if (tile.icon === "") return true;
      }, // use identity function as checkLocation so location values determine if they should be found
      tiles,
      [location],
      [],
      []
    );

    // reveal clicked tile
    let newTiles = updateMatrix(location, { ...tile, revealed: true }, tiles);

    // console.log(connectedEmptyLocations);

    // reveal all connected empty tiles
    connectedEmptyLocations.forEach(emptyLocation => {
      const emptyTile = getLocation(emptyLocation);

      newTiles = updateMatrix(
        emptyLocation,
        { ...emptyTile, revealed: true },
        newTiles
      );
    });

    setTiles(newTiles);
  };

  return (
    <>
      <GlobalStyle />
      <Map tiles={tiles} revealTile={revealTile} />
    </>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
