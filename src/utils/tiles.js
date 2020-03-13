import door from "../../assets/door_1f6aa.png";
import bomb from "../../assets/bomb_1f4a3.png";
import gold from "../../assets/money-bag_1f4b0.png";
import flag from "../../assets/triangular-flag-on-post_1f6a9.png";
import heart from "../../assets/heavy-black-heart_2764.png";
import compass from "../../assets/compass_1f9ed.png";
import map from "../../assets/world-map_1f5fa.png";
import telescope from "../../assets/telescope_1f52d.png";
import home from "../../assets/house-building_1f3e0.png";

const tileTypes = {
  DOOR: door,
  BOMB: bomb,
  GOLD: gold,
  EMPTY: "",
  FLAG: flag,
  HEART: heart,
  COMPASS: compass,
  MAP: map,
  TELESCOPE: telescope,
  HOME: home,
  LOCK: "🔒",
  KEY: "🔑"
};

function isTileEmpty(tile) {
  return (
    tile.icon !== tileTypes.BOMB &&
    tile.icon !== tileTypes.GOLD &&
    tile.icon !== tileTypes.DOOR &&
    tile.icon !== tileTypes.HOME &&
    tile.icon !== tileTypes.HEART &&
    tile.icon !== tileTypes.TELESCOPE &&
    tile.icon !== tileTypes.KEY
  );
}

function isTileDangerous(tile) {
  return tile.icon === tileTypes.BOMB;
}

function isTilePositive(tile) {
  return (
    tile.icon === tileTypes.GOLD ||
    tile.icon === tileTypes.DOOR ||
    tile.icon === tileTypes.HEART ||
    tile.icon === tileTypes.TELESCOPE ||
    tile.icon === tileTypes.KEY
  );
}

function isTileHouse(tile) {
  return tile.icon === tileTypes.HOME;
}

function isTileLocked(tile) {
  return tile.locked === true;
}

export {
  tileTypes,
  isTileEmpty,
  isTileDangerous,
  isTilePositive,
  isTileHouse,
  isTileLocked
};
