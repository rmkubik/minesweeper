const tileTypes = {
  DOOR: "🚪",
  BOMB: "💣",
  GOLD: "💰",
  EMPTY: "",
  FLAG: "🚩",
  HEART: "♥️",
  COMPASS: "🧭",
  MAP: "🗺️",
  TELESCOPE: "🔭",
  HOME: "🏠"
};

function isTileEmpty(tile) {
  return (
    tile.icon !== tileTypes.BOMB &&
    tile.icon !== tileTypes.GOLD &&
    tile.icon !== tileTypes.DOOR &&
    tile.icon !== tileTypes.HOME &&
    tile.icon !== tileTypes.HEART
  );
}

function isTileDangerous(tile) {
  return tile.icon === tileTypes.BOMB;
}

function isTilePositive(tile) {
  return (
    tile.icon === tileTypes.GOLD ||
    tile.icon === tileTypes.DOOR ||
    tile.icon === tileTypes.HEART
  );
}

function isTileHouse(tile) {
  return tile.icon === tileTypes.HOME;
}

export { tileTypes, isTileEmpty, isTileDangerous, isTilePositive, isTileHouse };
