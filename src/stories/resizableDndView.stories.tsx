/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable array-callback-return */
import React, { useEffect, useState, useCallback } from "react";
import RDnDView from "../components/RDnDView";
import RDndCanvas from "../components/RDnDCanvas";

import { RDndSystemContext, useInitialRDndSystemContext } from "../hooks";

export default {
  title: "Components/Resizable Drag and Drop View",
  component: RDnDView,
  parameters: {
    docs: {
      source: {
        type: "code",
      },
    },
  },
};

interface IResizableDndViewExample {}

export const ResizableDndViewExample: React.FC<IResizableDndViewExample> = () => {
  const rDndSystemContext = useInitialRDndSystemContext();
  const [viewCount, setViewCount] = useState(0);

  const addViewModal = useCallback(() => {
    rDndSystemContext.dndAddViewModal({
      id: `RDnDView${viewCount + 1}`,
      style: getDefaultDndViewStyle(viewCount),
      children: <span>{`RDnDView${viewCount + 1}`}</span>,
    });
    setViewCount(viewCount + 1);
  }, [viewCount, rDndSystemContext]);

  useEffect(() => {
    addViewModal();
  }, []);

  return (
    <RDndSystemContext.Provider value={rDndSystemContext}>
      <RDndCanvas />
      <button
        style={{
          position: "absolute",
          bottom: 20,
          height: 30,
          width: 100,
          zIndex: 3000,
        }}
        onClick={() => addViewModal()}
      >
        Add View
      </button>
    </RDndSystemContext.Provider>
  );
};

const getDefaultDndViewStyle = (index: number) => {
  const getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  return {
    width: getRandomInt(100, 200),
    height: getRandomInt(100, 200),
    left: 20 + index * 20,
    top: 20,
    // backgroundColor: "#" + Math.floor(Math.random() * 16777215).toString(16),
    textAlign: "center" as const,
    border: "1px solid #bfbfbf",
  };
};
