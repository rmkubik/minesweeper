import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import styled, { createGlobalStyle } from "styled-components";
import { updateMatrix, getLocation } from "functional-game-utils";
import {
  tileTypes,
  generateTiles,
  getMatchingLocations,
  isTileEmpty,
  pickRandomlyFromArray,
  revealTile
} from "./utils/index";
import Map from "./components/Map";
import Log from "./components/Log";
import Inventory from "./components/Inventory";

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
  const [hovered, setHovered] = useState({});
  const [actionLog, setActionLog] = useState([]);
  const [level, setLevel] = useState(0);
  const [inventory, setInventory] = useState({ [tileTypes.HEART]: 3 });

  const modifyInventoryItemCount = (item, increment) => {
    const invCopy = { ...inventory };

    if (!invCopy[item]) {
      invCopy[item] = 0;
    }

    invCopy[item] += increment;

    setInventory(invCopy);
  };

  const logAction = message => {
    setActionLog([...actionLog, message]);
  };

  // const revealTile = location => {
  //   const newTiles = revealConnectedTiles(tiles, location);
  //   const tile = getLocation(newTiles, location);
  //   const unFlaggedTiles = updateMatrix(
  //     location,
  //     { ...tile, flagged: false },
  //     newTiles
  //   );

  //   setTiles(unFlaggedTiles);
  // };

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

    let newTiles = revealTile(tiles, location);

    switch (tile.icon) {
      case tileTypes.GOLD:
        modifyInventoryItemCount(tileTypes.GOLD, 1);
        logAction(
          <p>
            Clicked {JSON.stringify(location)}. Found{" "}
            <img src={tileTypes.GOLD} />. Gain a gold.
          </p>
        );
        break;
      case tileTypes.BOMB:
        modifyInventoryItemCount(tileTypes.HEART, -1);
        logAction(
          <p>
            Clicked {JSON.stringify(location)}. Found{" "}
            <img src={tileTypes.BOMB} />. Lose a life.
          </p>
        );
        break;
      case tileTypes.HEART:
        modifyInventoryItemCount(tileTypes.HEART, 1);
        logAction(
          <p>
            Clicked {JSON.stringify(location)}. Found{" "}
            <img src={tileTypes.HEART} />. Gain a life.
          </p>
        );
        break;
      case tileTypes.DOOR:
        logAction(
          <p>
            Clicked {JSON.stringify(location)}. Found{" "}
            <img src={tileTypes.DOOR} />. Go to next level.
          </p>
        );
        setLevel(level + 1);
        generateNewTiles();
        break;
      case tileTypes.TELESCOPE: {
        logAction(
          <p>
            Clicked {JSON.stringify(location)}. Found{" "}
            <img src={tileTypes.TELESCOPE} />. Reveal random tile.
          </p>
        );
        const emptyLocations = getMatchingLocations(isTileEmpty, tiles);
        const target = pickRandomlyFromArray(emptyLocations);
        newTiles = revealTile(newTiles, target);
        break;
      }
      default:
        logAction(`Clicked ${JSON.stringify(location)}.`);
        break;
    }

    setTiles(newTiles);
  };

  useEffect(() => generateNewTiles(), []);

  return (
    <Root>
      <GlobalStyle />
      <Map
        tiles={tiles}
        revealTile={location => {
          handleClick(location);
        }}
        markTile={markTile}
        hoverTile={location => setHovered(location)}
        hovered={hovered}
        width={TILES_WIDE}
        height={TILES_HIGH}
      />
      <Panel>
        <Inventory inventory={inventory} />
        {/* <p>Inventory: {JSON.stringify(inventory)}</p> */}
        <p>Level: {level}</p>
      </Panel>
      <Panel>
        <Log messages={actionLog} />
      </Panel>
    </Root>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
