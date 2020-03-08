import React from "react";
import styled from "styled-components";
import { tileTypes, isTilePositive, isTileDangerous } from "../utils/index";

const TileContainer = styled.span`
  border: black solid 2px;
  text-align: center;

  img {
    width: 24px;
    height: 24px;
    margin: 4px;
  }

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
    displayIcon = tileTypes.FLAG;
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
        markTile(location, !flagged);
      }}
      onMouseOver={event => {
        hoverTile(location);
      }}
    >
      {displayIcon.includes(".png") ? <img src={displayIcon} /> : displayIcon}
    </TileContainer>
  );
};

export default Tile;
