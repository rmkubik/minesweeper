import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import gsap from "gsap";
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
      revealed ? "" : theme.colors.tiles.raisedHighlight};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.tiles.pressed};
    border-top-color: ${({ theme }) => theme.colors.tiles.borderShadow};
    border-left-color: ${({ theme }) => theme.colors.tiles.borderShadow};
    border-bottom-color: ${({ theme }) => theme.colors.tiles.borderHighlight};
    border-right-color: ${({ theme }) => theme.colors.tiles.borderHighlight};
  }

  ${({ revealed, theme }) =>
    revealed
      ? `
        border-color: ${theme.colors.tiles.revealedBorder};
        `
      : `
        border-top-color: ${theme.colors.tiles.borderHighlight};
        border-left-color: ${theme.colors.tiles.borderHighlight};
        border-bottom-color: ${theme.colors.tiles.borderShadow};
        border-right-color: ${theme.colors.tiles.borderShadow};
        `}

  ${({ theme, revealed, hovered, flagged, getTileValue }) => {
    if (!revealed && !flagged) {
      return `background-color: ${theme.colors.tiles.raised};`;
    }

    if (!hovered) {
      if (revealed) {
        return `background-color: ${theme.colors.tiles.revealed};`;
      } else {
        return `background-color: ${theme.colors.tiles.raised};`;
      }
    }

    if (flagged) {
      return `background-color: ${theme.colors.tiles.hazardTint};`;
    }

    if (getTileValue() > 0) {
      return `background-color: ${theme.colors.tiles.positiveTint};`;
    } else if (getTileValue() < 0) {
      return `background-color: ${theme.colors.tiles.hazardTint};`;
    } else {
      return `background-color: ${theme.colors.tiles.revealed};`;
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

  const timelineRef = useRef();
  const tileContaineRef = useRef();
  useEffect(() => {
    if (revealed && icon === tileTypes.DOOR) {
      timelineRef.current = gsap.timeline({
        repeat: -1,
        repeatRefresh: true
      });
      //add 3 tweens that will play in direct succession.
      timelineRef.current.to(tileContaineRef.current, {
        duration: 1,
        backgroundColor: "#f78181"
      });
      timelineRef.current.to(tileContaineRef.current, {
        duration: 1,
        backgroundColor: "#f7d281"
      });
      timelineRef.current.to(tileContaineRef.current, {
        duration: 1,
        backgroundColor: "#f7f181"
      });
      timelineRef.current.to(tileContaineRef.current, {
        duration: 1,
        backgroundColor: "#81f789"
      });
      timelineRef.current.to(tileContaineRef.current, {
        duration: 1,
        backgroundColor: "#81b0f7"
      });
      timelineRef.current.to(tileContaineRef.current, {
        duration: 1,
        backgroundColor: "#c481f7"
      });
    } else {
      if (timelineRef.current) {
        timelineRef.current.kill();
        tileContaineRef.current.style.removeProperty("background-color");
      }
    }
  }, [revealed, icon]);

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
      ref={tileContaineRef}
    >
      {displayIcon.includes(".png") ? <img src={displayIcon} /> : displayIcon}
    </TileContainer>
  );
};

export default Tile;
