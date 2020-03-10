import React, { useRef, useLayoutEffect } from "react";
import styled from "styled-components";
import { tileTypes } from "../utils/index";

const InventoryList = styled.div`
  padding: 0;
  overflow: scroll;
  margin: 0;
  max-height: 20vh;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;

  img {
    width: 22px;
    height: 22px;
    margin-bottom: 4px;
    vertical-align: bottom;
  }
`;

const InventoryItemContainer = styled.div`
  line-height: 26px;
  width: fit-content;
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
        <InventoryItem key={icon} icon={icon} count={count} />
      ))}
    </InventoryList>
  );
};

export default Inventory;
