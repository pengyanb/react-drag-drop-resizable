import React, { FC, useContext } from "react";
import { IRDndSystemContext, RDndSystemContext } from "../../hooks";

import RDnDView from "../RDnDView";

const RDnDCanvas: FC<IRDnDCanvasProps> = ({
  style = {},
  children,
  ...otherProps
}) => {
  style = {
    width: "100%",
    height: "100%",
    overflow: "auto",
    ...style,
  };
  const context = useContext<IRDndSystemContext>(RDndSystemContext);

  const renderRDnDStructure: (viewModal: IRDndViewModel) => React.ReactNode = (
    viewModal: IRDndViewModel
  ) => {
    if (Array.isArray(viewModal.children) && viewModal.children.length > 0) {
      return (
        <RDnDView
          key={viewModal.id}
          viewModal={viewModal}
          style={viewModal.style}
          resizeHandler={context.dndResizeHandler}
          dropHandler={context.dndDropHandler}
        >
          {viewModal.children.map((childViewModal: IRDndViewModel) =>
            renderRDnDStructure(childViewModal)
          )}
        </RDnDView>
      );
    } else {
      return (
        <RDnDView
          key={viewModal.id}
          viewModal={viewModal}
          style={viewModal.style}
          resizeHandler={context.dndResizeHandler}
          dropHandler={context.dndDropHandler}
        >
          {viewModal.children}
        </RDnDView>
      );
    }
  };

  return (
    <div style={style}>
      <>
        {context.rDndSystemState.viewModalStructure.map((viewModal) =>
          renderRDnDStructure(viewModal)
        )}
        {children}
      </>
    </div>
  );
};

export default RDnDCanvas;
