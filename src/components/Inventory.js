import React, { useRef, useLayoutEffect } from "react";
import styled from "styled-components";
import { tileTypes } from "../utils/index";

const InventoryList = styled.ul`
  list-style: none;
  padding: 0;
  overflow: scroll;
  margin: 0;

  img {
    width: 22px;
    height: 22px;
    margin-bottom: 4px;
    vertical-align: bottom;
  }
`;

const InventoryItemContainer = styled.li`
  line-height: 26px;
`;

const InventoryItem = ({ icon, count }) => (
  <InventoryItemContainer>
    <img src={icon} /> x{count}
  </InventoryItemContainer>
);

const Inventory = ({ inventory }) => {
  return (
    <InventoryList>
      {Object.entries(inventory).map(([icon, count]) => (
        <InventoryItem icon={icon} count={count} />
      ))}
    </InventoryList>
  );
};

export default Inventory;
