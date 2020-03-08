import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import styled, { createGlobalStyle } from "styled-components";
import { updateMatrix, getLocation } from "functional-game-utils";
import { tileTypes, generateTiles, revealConnectedTiles } from "./utils/index";
import Map from "./components/Map";
import Log from "./components/Log";

const TILES_WIDE = 15;
const TILES_HIGH = 15;

const GlobalStyle = createGlobalStyle`
  body {
    color: ${props => (props.whiteColor ? "white" : "black")};
    font-family: Helvetica, Arial, sans-serif;
    background-color: lightgray;
  }
`;

const Root = styled.div`
  border-top-color: aliceblue;
  border-left-color: aliceblue;
  border-bottom-color: gray;
  border-right-color: gray;
  background-color: lightgray;
  border-width: 4px;
  border-style: solid;
  padding: 8px;
`;

const Panel = styled.div`
  border-top-color: gray;
  border-left-color: gray;
  border-bottom-color: aliceblue;
  border-right-color: aliceblue;
  background-color: white;
  border-width: 4px;
  border-style: solid;
  margin-top: 16px;
  margin-bottom: 16px;
  padding: 6px;
`;

const App = () => {
  const [tiles, setTiles] = useState([]);
  const [gold, setGold] = useState(0);
  const [lives, setLives] = useState(3);
  const [hovered, setHovered] = useState({});
  const [actionLog, setActionLog] = useState([]);
  const [level, setLevel] = useState(0);

  const logAction = message => {
    setActionLog([...actionLog, message]);
  };

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

    if (tile.revealed) {
      // tile already reveealed, no new effect on click
      return;
    }

    switch (tile.icon) {
      case tileTypes.GOLD:
        setGold(gold + 1);
        logAction(
          `Clicked ${JSON.stringify(location)}. Found ${
            tileTypes.GOLD
          }. Gain a gold.`
        );
        break;
      case tileTypes.BOMB:
        setLives(lives - 1);
        logAction(
          `Clicked ${JSON.stringify(location)}. Found ${
            tileTypes.BOMB
          }. Lose a life.`
        );
        break;
      case tileTypes.HEART:
        setLives(lives + 1);
        logAction(
          `Clicked ${JSON.stringify(location)}. Found ${
            tileTypes.HEART
          }. Gain a life.`
        );
        break;
      case tileTypes.DOOR:
        logAction(
          `Clicked ${JSON.stringify(location)}. Found ${
            tileTypes.DOOR
          }. Go to next level.`
        );
        setLevel(level + 1);
        generateNewTiles();
        break;
      default:
        logAction(`Clicked ${JSON.stringify(location)}.`);
        break;
    }
  };

  useEffect(() => generateNewTiles(), []);

  return (
    <Root>
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
      <Panel>
        <p>Gold: {gold}</p>
        <p>Lives: {lives}</p>
        <p>Level: {level}</p>
      </Panel>
      <Panel>
        <Log messages={actionLog} />
      </Panel>
    </Root>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
