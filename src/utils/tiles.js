import door from "../../assets/door_1f6aa.png";
import bomb from "../../assets/bomb_1f4a3.png";
import gold from "../../assets/money-bag_1f4b0.png";
import flag from "../../assets/triangular-flag-on-post_1f6a9.png";
import heart from "../../assets/heavy-black-heart_2764.png";
import compass from "../../assets/compass_1f9ed.png";
import map from "../../assets/world-map_1f5fa.png";
import telescope from "../../assets/telescope_1f52d.png";
import home from "../../assets/house-building_1f3e0.png";
import key from "../../assets/key_1f511.png";
import lock from "../../assets/lock_1f512.png";
import germ from "../../assets/microbe_1f9a0.png";
import microscope from "../../assets/microscope_1f52c.png";
import sponge from "../../assets/sponge_1f9fd.png";

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
  LOCK: lock,
  KEY: key,
  GERM: germ,
  MICROSCOPE: microscope,
  SOAP: sponge
};

function isTileEmpty(tile) {
  return (
    tile.icon !== tileTypes.BOMB &&
    tile.icon !== tileTypes.GOLD &&
    tile.icon !== tileTypes.DOOR &&
    tile.icon !== tileTypes.HOME &&
    tile.icon !== tileTypes.HEART &&
    tile.icon !== tileTypes.TELESCOPE &&
    tile.icon !== tileTypes.KEY &&
    tile.icon !== tileTypes.SOAP &&
    tile.icon !== tileTypes.MICROSCOPE
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
    tile.icon === tileTypes.KEY ||
    tile.icon === tileTypes.SOAP ||
    tile.icon === tileTypes.MICROSCOPE
  );
}

function isTileHouse(tile) {
  return tile.icon === tileTypes.HOME;
}

function isTileLocked(tile) {
  return tile.locked === true;
}

function isTileInfected(tile) {
  return tile.infected === true;
}

export {
  tileTypes,
  isTileEmpty,
  isTileDangerous,
  isTilePositive,
  isTileHouse,
  isTileLocked,
  isTileInfected
};
