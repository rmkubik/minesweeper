import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";
import { updateMatrix, getLocation, mapMatrix } from "functional-game-utils";
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
import themes from "./utils/themes";

const TILES_WIDE = 15;
const TILES_HIGH = 15;

const GlobalStyle = createGlobalStyle`
  body {
    color: ${({ theme }) => theme.colors.text};
    font-family: Helvetica, Arial, sans-serif;
    background-color: ${({ theme }) => theme.colors.body};
  }
`;

const Root = styled.div`
  border-top-color: ${({ theme }) => theme.colors.borderHighlight};
  border-left-color: ${({ theme }) => theme.colors.borderHighlight};
  border-bottom-color: ${({ theme }) => theme.colors.borderShadow};
  border-right-color: ${({ theme }) => theme.colors.borderShadow};
  background-color: ${({ theme }) => theme.colors.raised};
  border-width: 4px;
  border-style: solid;
  padding: 8px;
`;

const Panel = styled.div`
  border-top-color: ${({ theme }) => theme.colors.borderShadow};
  border-left-color: ${({ theme }) => theme.colors.borderShadow};
  border-bottom-color: ${({ theme }) => theme.colors.borderHighlight};
  border-right-color: ${({ theme }) => theme.colors.borderHighlight};
  background-color: ${({ theme }) => theme.colors.panelBackground};
  border-width: 4px;
  border-style: solid;
  margin-top: 16px;
  margin-bottom: 16px;
  padding: 6px;
`;

function isItemAvailable(inventory, item) {
  if (!inventory[item]) {
    return false;
  }

  if (inventory[item].count <= 0) {
    return false;
  }

  return true;
}

const App = () => {
  const [tiles, setTiles] = useState([]);
  const [hovered, setHovered] = useState({});
  const [actionLog, setActionLog] = useState([]);
  const [level, setLevel] = useState(0);
  const [inventory, setInventory] = useState({
    [tileTypes.HEART]: { count: 3 }
  });
  const [theme, setTheme] = useState(themes.minesweeper);

  useEffect(() => {
    if (inventory[tileTypes.HEART].count <= 0) {
      alert("Game Over! You ran out of hearts! Click OK to restart.");
      window.location.reload();
    }
  }, [inventory]);

  useEffect(() => {
    if (level >= 9) {
      alert("You Win! You got to level 9! Click OK to restart.");
      window.location.reload();
    }
  }, [level]);

  const modifyInventoryItemCount = (item, increment) => {
    const invCopy = { ...inventory };

    if (!invCopy[item]) {
      invCopy[item] = { count: 0 };

      if (item === tileTypes.TELESCOPE) {
        // useable items
        invCopy[item].useable = true;
      }
    }

    invCopy[item].count += increment;

    setInventory(invCopy);
  };

  const logAction = message => {
    setActionLog([...actionLog, message]);
  };

  const markTile = (location, marked) => {
    const tile = getLocation(tiles, location);

    setTiles(updateMatrix(location, { ...tile, flagged: marked }, tiles));
  };

  const useItem = item => {
    if (!isItemAvailable(inventory, item)) {
      return;
    }

    switch (item) {
      case tileTypes.TELESCOPE: {
        logAction(
          <p>
            Used <img src={tileTypes.TELESCOPE} />. Reveal random tile.
          </p>
        );
        const emptyLocations = getMatchingLocations(
          tile => !tile.revealed && isTileEmpty(tile),
          tiles
        );

        const target = pickRandomlyFromArray(emptyLocations);
        if (!target) {
          break;
        }

        const newTiles = revealTile(tiles, target);
        setTiles(newTiles);
        modifyInventoryItemCount(tileTypes.TELESCOPE, -1);
        break;
      }
      default:
        logAction(`Tried to use invalid item.`);
        break;
    }
  };

  const handleClick = location => {
    const tile = getLocation(tiles, location);

    if (tile.revealed) {
      // tile already reveealed, no new effect on click
      return;
    }

    if (!tile.revealed && tile.locked) {
      // tile is locked, no clicking
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
        newTiles = generateTiles(
          {
            height: TILES_HIGH,
            width: TILES_WIDE
          },
          { level: level + 1 }
        );
        break;
      case tileTypes.TELESCOPE: {
        logAction(
          <p>
            Clicked {JSON.stringify(location)}. Found{" "}
            <img src={tileTypes.TELESCOPE} />.
          </p>
        );
        modifyInventoryItemCount(tileTypes.TELESCOPE, 1);

        newTiles = revealTile(newTiles, location);
        break;
      }
      case tileTypes.KEY: {
        logAction(
          <p>
            Clicked {JSON.stringify(location)}. Found{" "}
            <img src={tileTypes.KEY} />. Unlock locked tiles.
          </p>
        );

        newTiles = mapMatrix(tile => ({ ...tile, locked: false }), tiles);
        newTiles = revealTile(newTiles, location);
        break;
      }
      default:
        logAction(`Clicked ${JSON.stringify(location)}.`);
        break;
    }

    setTiles(newTiles);
  };

  useEffect(() => {
    const initialTiles = generateTiles(
      {
        height: TILES_HIGH,
        width: TILES_WIDE
      },
      { level }
    );

    setTiles(initialTiles);
  }, []);

  useEffect(() => {
    switch (level) {
      case 1:
        setTheme(themes.locked);
        break;
      default:
        setTheme(themes.minesweeper);
        break;
    }
  }, [level, setTheme]);

  return (
    <ThemeProvider theme={theme}>
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
          <Inventory inventory={inventory} useItem={useItem} />
          {/* <p>Inventory: {JSON.stringify(inventory)}</p> */}
          <p>Level: {level}</p>
        </Panel>
        <Panel>
          <Log messages={actionLog} />
        </Panel>
      </Root>
    </ThemeProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
