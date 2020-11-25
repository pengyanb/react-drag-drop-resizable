/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable array-callback-return */
import React, { useContext, useEffect, useState, useCallback } from "react";
import ResizableDnDView from "../components/ResizableDnDView";
import {
  DndSystemContext,
  useInitialDndSystemContext,
  IDndSystemContext,
} from "../hooks";

const defaultExpost = {
  title: "Components/Resizable Drag and Drop View",
  component: ResizableDnDView,
};

export default defaultExpost;

const renderResizableDndView: (
  viewModal: IDndViewModel,
  context: IDndSystemContext
) => any = (viewModal, context) => {
  if (Array.isArray(viewModal.children) && viewModal.children.length > 0) {
    return (
      <ResizableDnDView
        key={viewModal.id}
        viewModal={viewModal}
        style={viewModal.style}
        resizeHandler={context.dndResizeHandler}
        dropHandler={context.dndDropHandler}
      >
        {viewModal.id}
        {viewModal.children.map((childViewModal) =>
          renderResizableDndView(childViewModal, context)
        )}
      </ResizableDnDView>
    );
  } else {
    return (
      <ResizableDnDView
        key={viewModal.id}
        viewModal={viewModal}
        style={viewModal.style}
        resizeHandler={context.dndResizeHandler}
        dropHandler={context.dndDropHandler}
      >
        {viewModal.id}
      </ResizableDnDView>
    );
  }
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

interface IDndCanvas {}
const DndCanvas: React.FC<IDndCanvas> = () => {
  const context = useContext<IDndSystemContext>(DndSystemContext);
  const [viewCount, setViewCount] = useState(0);

  const addViewModal = useCallback(() => {
    context.dndAddViewModal({
      id: `dndView${viewCount + 1}`,
      style: getDefaultDndViewStyle(viewCount),
    });
    setViewCount(viewCount + 1);
  }, [viewCount, context]);

  useEffect(() => {
    addViewModal();
  }, []);

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "80vh",
          overflow: "auto",
        }}
      >
        {context.dndSystemState.viewModalStructure.map((viewModal) =>
          renderResizableDndView(viewModal, context)
        )}
      </div>
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
    </>
  );
};

interface IResizableDndViewExample {}

export const ResizableDndViewExample: React.FC<IResizableDndViewExample> = () => {
  const initalDndSystemContext = useInitialDndSystemContext();

  return (
    <DndSystemContext.Provider value={initalDndSystemContext}>
      <DndCanvas />
    </DndSystemContext.Provider>
  );
};
