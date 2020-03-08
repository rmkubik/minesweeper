import React from "react";
import styled from "styled-components";
import {
  isLocationInBounds,
  getNeighbors,
  getAllDirections,
  mapMatrix,
  compareLocations
} from "functional-game-utils";
import Tile from "./Tile";

const MapContainer = styled.div`
  display: grid;
  grid-template-columns: ${({ tileSize, width }) =>
    `${tileSize}px `.repeat(width)};

  border-top-color: gray;
  border-left-color: gray;
  border-bottom-color: aliceblue;
  border-right-color: aliceblue;
  background-color: lightgray;
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
  height
}) => {
  let hoveredNeighbors = [];

  if (isLocationInBounds(tiles, hovered)) {
    hoveredNeighbors = getNeighbors(getAllDirections, tiles, hovered);
  }

  return (
    <MapContainer tileSize={32} width={width}>
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

export default Map;
