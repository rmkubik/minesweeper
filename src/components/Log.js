import React, { useRef, useLayoutEffect } from "react";
import styled from "styled-components";

const LogList = styled.ul`
  list-style: none;
  padding: 0;
  height: 20vh;
  overflow: scroll;
  margin: 0;

  img {
    width: 22px;
    height: 22px;
    margin-bottom: 4px;
    vertical-align: bottom;
  }

  p {
    margin: 0;
  }
`;

const LogItem = styled.li`
  line-height: 26px;
`;

const Log = ({ messages }) => {
  const logListRef = useRef();

  useLayoutEffect(() => {
    logListRef.current.scrollTop = logListRef.current.scrollHeight;
  }, [messages]);

  return (
    <LogList ref={logListRef}>
      {messages.map((message, index) => (
        <LogItem key={index}>{message}</LogItem>
      ))}
    </LogList>
  );
};

export default Log;
