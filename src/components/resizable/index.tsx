import React, { FC, useRef } from "react";
import classnames from "classnames";

import * as styles from "./index.scss";

const DefaultZIndex = 2000;

const DefaultEdgeDirections: IResizeDirection[] = ["n", "s", "w", "e"];
const DefaultCornerDirections: IResizeDirection[] = ["nw", "ne", "sw", "se"];

const Resizable: FC<IResizableProps> = ({
  onResizing,
  width = 250,
  height = 250,
  resizeEdgeWidth = 6,
  resizeDirections = ["n", "s", "w", "e", "nw", "ne", "sw", "se"],
  proportional = true,
  style = {},
  children,
}) => {
  const styleResizable: React.CSSProperties = {
    position: "relative",
    width,
    height,
    ...style,
  };

  const resizeRef = useRef({
    resizing: false,
    resizeDirection: "",
    mouseScreenX: 0,
    mouseScreenY: 0,
    width,
    height,
  });

  const domRef = useRef<HTMLDivElement>(null);
  resizeRef.current.width = width;
  resizeRef.current.height = height;

  const handleResizeStart = (
    direction: IResizeDirection,
    event: React.MouseEvent
  ) => {
    if (event.button === 0) {
      resizeRef.current.resizing = true;
      resizeRef.current.resizeDirection = direction;
      resizeRef.current.mouseScreenX = event.screenX;
      resizeRef.current.mouseScreenY = event.screenY;
      document.addEventListener("mousemove", handleResizing);
      document.addEventListener("mouseup", handleResizeStop);
    }
  };

  const handleResizing = (event: MouseEvent) => {
    const {
      resizing,
      resizeDirection,
      mouseScreenX,
      mouseScreenY,
    } = resizeRef.current;
    if (resizing) {
      const dx = event.screenX - mouseScreenX;
      const dy = event.screenY - mouseScreenY;
      resizeRef.current.mouseScreenX = event.screenX;
      resizeRef.current.mouseScreenY = event.screenY;
      switch (resizeDirection) {
        case "w":
          handleHorizontalResizing(-dx);
          break;
        case "e":
          handleHorizontalResizing(dx);
          break;
        case "n":
          handleVerticalResizing(-dy);
          break;
        case "s":
          handleVerticalResizing(dy);
          break;
        default:
          break;
      }
    }
  };

  const handleResizeStop = (event: MouseEvent) => {
    if (event.button === 0) {
      resizeRef.current.resizing = false;
      resizeRef.current.resizeDirection = "";
      resizeRef.current.mouseScreenX = event.screenX;
      resizeRef.current.mouseScreenY = event.screenY;
      document.removeEventListener("mousemove", handleResizing);
      document.removeEventListener("mouseup", handleResizeStop);
    }
  };

  const handleHorizontalResizing = (dx: number) => {
    if (dx !== 0) {
      if (typeof width === "number") {
        const currentWidth: number = resizeRef.current.width as number;
        const newWidth = currentWidth + dx;
        onResizing({ width: newWidth, height });
      } else if (width.endsWith("%") && domRef.current) {
        const parentNode = domRef.current.parentNode as HTMLElement;
        const parentRect = parentNode.getBoundingClientRect();
        if (parentRect.width && parentRect.width > 0) {
          const currentWidth = parseFloat(
            (resizeRef.current.width as string).replace("%", "")
          );
          const newWidth = `${currentWidth + (dx * 100) / parentRect.width}%`;
          onResizing({ width: newWidth, height });
        }
      }
    }
  };

  const handleVerticalResizing = (dy: number) => {
    if (dy !== 0) {
      if (typeof height === "number") {
        const currentHeight = resizeRef.current.height as number;
        const newHeight = currentHeight + dy;
        onResizing({ width, height: newHeight });
      } else if (height.endsWith("%") && domRef.current) {
        const parentNode = domRef.current.parentNode as HTMLElement;
        const parentRect = parentNode.getBoundingClientRect();
        if (parentRect.height && parentRect.height > 0) {
          const currentHeight = parseFloat(
            (resizeRef.current.height as string).replace("%", "")
          );
          const newHeight = `${
            currentHeight + (dy * 100) / parentRect.height
          }%`;
          onResizing({ width, height: newHeight });
        }
      }
    }
  };

  const getResizeEdgeStyleProps = (resizeDirection: IResizeDirection) => {
    let width: string | number | undefined;
    let height: string | number | undefined;
    let top: number | undefined;
    let bottom: number | undefined;
    let left: number | undefined;
    let right: number | undefined;
    let cursor = "ns-resize";
    switch (resizeDirection) {
      case "n":
        width = styleResizable.width;
        height = resizeEdgeWidth;
        top = -resizeEdgeWidth / 2;
        bottom = undefined;
        left = 0;
        right = undefined;
        cursor = "ns-resize";
        break;
      case "s":
        width = styleResizable.width;
        height = resizeEdgeWidth;
        top = undefined;
        bottom = -resizeEdgeWidth / 2;
        left = 0;
        right = undefined;
        cursor = "ns-resize";
        break;
      case "w":
        width = resizeEdgeWidth;
        height = styleResizable.height;
        top = 0;
        bottom = undefined;
        left = -resizeEdgeWidth / 2;
        right = undefined;
        cursor = "ew-resize";
        break;
      case "e":
        width = resizeEdgeWidth;
        height = styleResizable.height;
        top = 0;
        bottom = undefined;
        left = undefined;
        right = -resizeEdgeWidth / 2;
        cursor = "ew-resize";
        break;
      default:
        break;
    }
    return {
      width,
      height,
      top,
      bottom,
      left,
      right,
      cursor,
    };
  };

  const renderResizableEdge = (resizeDirection: IResizeDirection) => {
    if (resizeDirections.includes(resizeDirection)) {
      return (
        <div
          className={classnames(styles.resizableEdge)}
          onMouseDown={(event) => {
            event.stopPropagation();
            event.preventDefault();
            handleResizeStart(resizeDirection, event);
          }}
          style={{
            position: "absolute",
            zIndex: DefaultZIndex,
            ...getResizeEdgeStyleProps(resizeDirection),
          }}
        />
      );
    }
    return null;
  };

  const renderResizableCorner = (resizeDirection: IResizeDirection) => {
    return null;
  };

  return (
    <div style={styleResizable} ref={domRef}>
      {DefaultEdgeDirections.map((resizeDirection) =>
        renderResizableEdge(resizeDirection)
      )}
      {DefaultCornerDirections.map((resizeDirection) =>
        renderResizableCorner(resizeDirection)
      )}
      {children}
    </div>
  );
};

export default Resizable;
