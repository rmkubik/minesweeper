import React from "react";
import styled from "styled-components";
import { tileTypes, isTilePositive, isTileDangerous } from "../utils/index";

const TileContainer = styled.span`
  border-width: 2px;
  border-style: solid;
  text-align: center;

  img {
    width: 24px;
    height: 24px;
    margin: 4px;
  }

  &:hover {
    background-color: ${({ revealed, theme }) =>
      revealed ? "" : theme.colors.raisedHighlight};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.pressed};
    border-top-color: ${({ theme }) => theme.colors.borderShadow};
    border-left-color: ${({ theme }) => theme.colors.borderShadow};
    border-bottom-color: ${({ theme }) => theme.colors.borderHighlight};
    border-right-color: ${({ theme }) => theme.colors.borderHighlight};
  }

  ${({ revealed, theme }) =>
    revealed
      ? `
        border-color: ${theme.colors.revealedBorder};
        `
      : `
        border-top-color: ${theme.colors.borderHighlight};
        border-left-color: ${theme.colors.borderHighlight};
        border-bottom-color: ${theme.colors.borderShadow};
        border-right-color: ${theme.colors.borderShadow};
        `}

  ${({ theme, revealed, hovered, flagged, getTileValue }) => {
    if (!revealed && !flagged) {
      return `background-color: ${theme.colors.raised};`;
    }

    if (!hovered) {
      if (revealed) {
        return `background-color: ${theme.colors.revealed};`;
      } else {
        return `background-color: ${theme.colors.raised};`;
      }
    }

    if (flagged) {
      return `background-color: ${theme.colors.hazardTint};`;
    }

    if (getTileValue() > 0) {
      return `background-color: ${theme.colors.positiveTint};`;
    } else if (getTileValue() < 0) {
      return `background-color: ${theme.colors.hazardTint};`;
    } else {
      return `background-color: ${theme.colors.revealed};`;
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
  hovered,
  locked
}) => {
  let displayIcon = "";

  if (flagged) {
    displayIcon = tileTypes.FLAG;
  }

  if (revealed) {
    displayIcon = icon;
  }

  if (locked && !revealed) {
    displayIcon = tileTypes.LOCK;
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
