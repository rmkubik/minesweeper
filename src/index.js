import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { createGlobalStyle } from "styled-components";
import { updateMatrix, getLocation } from "functional-game-utils";
import { tileTypes, generateTiles, revealConnectedTiles } from "./utils/index";
import Map from "./components/Map";

const TILES_WIDE = 15;
const TILES_HIGH = 15;

const GlobalStyle = createGlobalStyle`
  body {
    color: ${props => (props.whiteColor ? "white" : "black")};
    font-family: Helvetica, Arial, sans-serif;
  }
`;

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

  const generateNewTiles = () => {
    const initialTiles = generateTiles({
      height: TILES_HIGH,
      width: TILES_WIDE
    });

    setTiles(initialTiles);
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
        generateNewTiles();
        break;
      default:
        break;
    }
  };

  useEffect(() => generateNewTiles(), []);

  return (
    <>
      <GlobalStyle />
      <Map
        tiles={tiles}
        revealTile={location => {
          revealTile(location);
          handleClick(location);
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
