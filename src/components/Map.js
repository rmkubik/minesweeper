import React from "react";
import styled from "styled-components";
import {
  isLocationInBounds,
  getNeighbors,
  getAllDirections,
  mapMatrix,
  compareLocations,
  getLocation,
} from "functional-game-utils";
import Tile from "./Tile";
import { isTileDangerous, isTilePositive } from "../utils";

const MapContainer = styled.div`
  user-select: none;
  cursor: pointer;

  display: grid;
  grid-template-columns: ${({ tileSize, width }) =>
    `${tileSize}px `.repeat(width)};

  border-top-color: ${({ theme }) => theme.colors.borderShadow};
  border-left-color: ${({ theme }) => theme.colors.borderShadow};
  border-bottom-color: ${({ theme }) => theme.colors.borderHighlight};
  border-right-color: ${({ theme }) => theme.colors.borderHighlight};
  background-color: ${({ theme }) => theme.colors.raised};
  border-width: 4px;
  border-style: solid;

  span {
    width: ${({ tileSize }) => tileSize}px;
    height: ${({ tileSize }) => tileSize}px;
    line-height: ${({ tileSize }) => tileSize}px;
  }
`;

const Map = ({
  tiles,
  revealTile,
  markTile,
  hoverTile,
  hovered,
  width,
  height,
  inventory,
}) => {
  let hoveredNeighbors = [];

  if (isLocationInBounds(tiles, hovered)) {
    hoveredNeighbors = getNeighbors(getAllDirections, tiles, hovered);
  }

  return (
    <MapContainer tileSize={32} width={width}>
      {mapMatrix((tile, location) => {
        const neighbors = getNeighbors(getAllDirections, tiles, location).map(
          (neighborLocation) => getLocation(tiles, neighborLocation)
        );

        // if tile is revealed
        // isTilePositive and isTileNegative modify the appropriate neighbor values
        // if tile is flagged, remove a neighbor value

        const positiveNeighbors = neighbors.filter(
          (neighbor) => isTilePositive(neighbor) && !neighbor.revealed
        ).length;
        const dangerousNeighbors = neighbors.filter(
          (neighbor) => isTileDangerous(neighbor) && !neighbor.revealed
        ).length;
        const flaggedNeighbors = neighbors.filter(
          (neighbor) => neighbor.flagged
        ).length;

        return (
          <Tile
            key={location.row * 10 + location.col}
            revealTile={revealTile}
            location={location}
            markTile={markTile}
            hoverTile={hoverTile}
            inventory={inventory}
            hovered={hoveredNeighbors.some((hoveredLocation) =>
              compareLocations(hoveredLocation, location)
            )}
            {...tile}
            neighbors={{
              positive: positiveNeighbors,
              dangerous: dangerousNeighbors - flaggedNeighbors,
            }}
          />
        );
      }, tiles)}
    </MapContainer>
  );
};

export default Map;
