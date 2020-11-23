import React, {
  FC,
  useRef,
  useState,
  useContext,
  useCallback,
  useLayoutEffect,
} from "react";

import { DndSystemContext } from "../../hooks/index";
import "./index.scss";

const DefaultZIndex = 2000;
const DefaultPos = { x: 0, y: 0 };
const DefaultWidthStyle = "fit-content";
const DefaultHeightStyle = "fit-content";

const DefaultEdgeDirections: IResizeDirection[] = ["n", "s", "w", "e"];
const DefaultCornerDirections: IResizeDirection[] = ["nw", "ne", "sw", "se"];

interface IDragRef {
  isDragging: boolean;
  mouseDownAtViewPos: I2DCoordinate;
  translation: I2DCoordinate;
  posOrigin: I2DCoordinate;
  pos: I2DCoordinate;
}

interface IResizeRef {
  resizing: boolean;
  resizeDirection: IResizeDirection;
  mouseScreenX: number;
  mouseScreenY: number;
  width: string | number | undefined;
  height: string | number | undefined;
}

const ResizableDnDView: FC<IResizableDnDProps> = ({
  viewModal,
  resizeHandler,
  resizeEdgeWidth = 6,
  resizeDirections = ["n", "s", "w", "e", "nw", "ne", "sw", "se"],
  style = {},
  children,
  dropHandler,
  onDrag = () => {},
  onDragEnd = () => {},
  onFocus = () => {},
  refToForward,
  ...otherProps
}) => {
  const resizeRef: React.MutableRefObject<IResizeRef> = useRef({
    resizing: false,
    resizeDirection: "n",
    mouseScreenX: 0,
    mouseScreenY: 0,
    width: style.width,
    height: style.height,
  });

  resizeRef.current.width = style.width || DefaultWidthStyle;
  resizeRef.current.height = style.height || DefaultHeightStyle;

  const {
    dndSystemState,
    dndSetDropInfo,
    dndAddDraggingViewModal,
    dndRemoveAllDraggingViewModals,
    dndSetDropTargetViewModal,
  } = useContext(DndSystemContext);

  const domRef = useRef<HTMLDivElement>(null);
  refToForward?.(domRef);
  viewModal.viewRef = domRef;

  const dragRef = useRef<IDragRef>({
    isDragging: false,
    mouseDownAtViewPos: DefaultPos,
    translation: DefaultPos,
    posOrigin: DefaultPos,
    pos: DefaultPos,
  });

  const viewModalRef = useRef<IDndViewModel>(viewModal);
  viewModalRef.current = viewModal;
  const dndSystemStateRef = useRef(dndSystemState);
  dndSystemStateRef.current = dndSystemState;

  const [dragState, setDragState] = useState(dragRef.current);

  useLayoutEffect(() => {
    const width = resizeRef.current.width;
    const height = resizeRef.current.height;
    if (
      !dragState.isDragging &&
      domRef.current &&
      (width === DefaultWidthStyle || height === DefaultHeightStyle)
    ) {
      const widthPx = domRef.current.clientWidth;
      resizeRef.current.width = widthPx;
      const heightPx = domRef.current.clientHeight;
      resizeRef.current.height = heightPx;

      resizeHandler(viewModalRef.current, { width: widthPx, height: heightPx });
    }
  });

  const draggedStyles = useCallback<() => React.CSSProperties>(
    () => ({
      ...style,
      cursor: "grabbing",
      zIndex: DefaultZIndex,
      position: "fixed",
      top: dragState.pos.y,
      left: dragState.pos.x,
      pointerEvents: "none",
    }),
    [dragState, style]
  );

  const staticStyles = useCallback<() => React.CSSProperties>(
    () => ({
      ...style,
      position: "absolute",
      cursor: "grab",
    }),
    [style]
  );

  const handleResizing = (event: MouseEvent) => {
    const {
      resizing,
      resizeDirection,
      mouseScreenX,
      mouseScreenY,
    } = resizeRef.current;
    if (resizing) {
      let newWidth: string | number | undefined;
      let newHeight: string | number | undefined;
      let dx = event.screenX - mouseScreenX;
      let dy = event.screenY - mouseScreenY;
      resizeRef.current.mouseScreenX = event.screenX;
      resizeRef.current.mouseScreenY = event.screenY;
      switch (resizeDirection) {
        case "w":
          dx = -dx;
          newWidth = handleHorizontalResizing(dx);
          break;
        case "e":
          newWidth = handleHorizontalResizing(dx);
          break;
        case "n":
          dy = -dy;
          newHeight = handleVerticalResizing(dy);
          break;
        case "s":
          newHeight = handleVerticalResizing(dy);
          break;
        case "nw":
          dx = -dx;
          dy = -dy;
          newWidth = handleHorizontalResizing(dx);
          newHeight = handleVerticalResizing(dy);
          break;
        case "ne":
          dy = -dy;
          newWidth = handleHorizontalResizing(dx);
          newHeight = handleVerticalResizing(dy);
          break;
        case "sw":
          dx = -dx;
          newWidth = handleHorizontalResizing(dx);
          newHeight = handleVerticalResizing(dy);
          break;
        case "se":
          newWidth = handleHorizontalResizing(dx);
          newHeight = handleVerticalResizing(dy);
          break;
        default:
          break;
      }

      if (newWidth !== undefined || newHeight !== undefined) {
        resizeHandler(viewModalRef.current, {
          width: newWidth,
          height: newHeight,
          resizeDirection,
          dx: dx,
          dy: dy,
        });
      }
    }
  };

  const handleResizeStart = (
    direction: IResizeDirection,
    event: React.MouseEvent
  ) => {
    if (resizeRef.current.resizing) {
      return;
    }
    if (event.button === 0) {
      event.preventDefault();
      event.stopPropagation();
      resizeRef.current.resizing = true;
      resizeRef.current.resizeDirection = direction;
      resizeRef.current.mouseScreenX = event.screenX;
      resizeRef.current.mouseScreenY = event.screenY;
      document.addEventListener("mousemove", handleResizing);
      document.addEventListener("mouseup", handleResizeStop);
    }
  };

  const handleResizeStop = (event: MouseEvent) => {
    if (event.button === 0) {
      event.stopPropagation();
      event.preventDefault();
      resizeRef.current.resizing = false;
      resizeRef.current.resizeDirection = "n";
      resizeRef.current.mouseScreenX = event.screenX;
      resizeRef.current.mouseScreenY = event.screenY;
      document.removeEventListener("mousemove", handleResizing);
      document.removeEventListener("mouseup", handleResizeStop);
    }
  };

  const handleHorizontalResizing = (dx: number) => {
    let newWidth: string | number | undefined;
    if (dx !== 0) {
      const width = resizeRef.current.width;
      if (typeof width === "number") {
        const currentWidth: number = resizeRef.current.width as number;
        newWidth = currentWidth + dx;
      } else if (width?.endsWith("%") && domRef.current) {
        const parentNode = domRef.current.parentNode as HTMLElement;
        const parentRect = parentNode.getBoundingClientRect();
        if (parentRect.width && parentRect.width > 0) {
          const currentWidth = parseFloat(
            (resizeRef.current.width as string).replace("%", "")
          );
          newWidth = `${currentWidth + (dx * 100) / parentRect.width}%`;
        }
      }
    }
    return newWidth;
  };

  const handleVerticalResizing = (dy: number) => {
    let newHeight: string | number | undefined;
    if (dy !== 0) {
      const height = resizeRef.current.height;
      if (typeof height === "number") {
        const currentHeight = resizeRef.current.height as number;
        newHeight = currentHeight + dy;
      } else if (height?.endsWith("%") && domRef.current) {
        const parentNode = domRef.current.parentNode as HTMLElement;
        const parentRect = parentNode.getBoundingClientRect();
        if (parentRect.height && parentRect.height > 0) {
          const currentHeight = parseFloat(
            (resizeRef.current.height as string).replace("%", "")
          );
          newHeight = `${currentHeight + (dy * 100) / parentRect.height}%`;
        }
      }
    }
    return newHeight;
  };

  const onMouseDown: (event: React.MouseEvent) => void = (event) => {
    const { clientX, clientY, button } = event;
    event.stopPropagation();
    event.preventDefault();
    const boundingRect = domRef.current?.getBoundingClientRect();
    if (button === 0 && boundingRect !== undefined) {
      domRef.current?.focus();
      onFocus?.(event.shiftKey);
      dndSetDropInfo(null);
      if (!event.shiftKey) {
        dndRemoveAllDraggingViewModals();
      }

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      const mouseDownAtViewPos = {
        x: clientX - boundingRect.left,
        y: clientY - boundingRect.top,
      };
      const pos = {
        x: clientX - mouseDownAtViewPos.x,
        y: clientY - mouseDownAtViewPos.y,
      };
      dragRef.current = {
        ...dragRef.current,
        isDragging: true,
        mouseDownAtViewPos,
        posOrigin: { x: clientX, y: clientY },
        pos,
      };
      setDragState(dragRef.current);
      dndAddDraggingViewModal(viewModalRef.current, event.shiftKey);
    }
  };

  const onMouseMove: (event: MouseEvent) => void = (event) => {
    const { clientX, clientY } = event;
    event.stopPropagation();
    event.preventDefault();
    const translation = {
      x: clientX - dragRef.current.posOrigin.x,
      y: clientY - dragRef.current.posOrigin.y,
    };
    const pos = {
      x: clientX - dragRef.current.mouseDownAtViewPos.x,
      y: clientY - dragRef.current.mouseDownAtViewPos.y,
    };
    dragRef.current = {
      ...dragRef.current,
      translation,
      pos,
    };
    setDragState(dragRef.current);
    onDrag({
      viewModals: dndSystemStateRef.current.draggingViewModels,
      translation,
    });
  };

  const onMouseUp: (event: MouseEvent) => void = (event) => {
    const { clientX, clientY, button } = event;
    event.stopPropagation();
    event.preventDefault();
    if (button === 0) {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      const translation = {
        x: clientX - dragRef.current.posOrigin.x,
        y: clientY - dragRef.current.posOrigin.y,
      };

      const pos = {
        x: clientX - dragRef.current.mouseDownAtViewPos.x,
        y: clientY - dragRef.current.mouseDownAtViewPos.y,
      };

      const dropInfo: IDropInfo = {
        viewModals: dndSystemStateRef.current.draggingViewModels,
        pos,
        translation,
        mouseDownAtViewPos: dragRef.current.mouseDownAtViewPos,
        toViewModal: dndSystemStateRef.current.dropTargetViewModal,
      };

      onDragEnd(dropInfo);
      dndSetDropInfo(dropInfo);
      dropHandler(dropInfo);

      dragRef.current = {
        ...dragRef.current,
        isDragging: false,
        mouseDownAtViewPos: DefaultPos,
        posOrigin: DefaultPos,
        translation: DefaultPos,
        pos: DefaultPos,
      };
      setDragState(dragRef.current);
    }
  };

  const onMouseOver: (event: React.MouseEvent) => void = (event) => {
    event.stopPropagation();
    event.preventDefault();
    const draggingViewModels = dndSystemStateRef.current.draggingViewModels;
    if (
      draggingViewModels.length > 0 &&
      draggingViewModels.reduce(
        (acc, it) => acc && it.id !== viewModalRef.current.id,
        true
      )
    ) {
      dndSetDropTargetViewModal(viewModalRef.current);
    }
  };

  const onMouseOut: (event: React.MouseEvent) => void = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (
      dndSystemStateRef.current.dropTargetViewModal &&
      dndSystemStateRef.current.dropTargetViewModal.id ===
        viewModalRef.current.id
    ) {
      dndSetDropTargetViewModal(null);
    }
  };

  const getResizeEdgeStyleProps: (
    resizeDirection: IResizeDirection
  ) => React.CSSProperties = (resizeDirection: IResizeDirection) => {
    let width: string | number | undefined;
    let height: string | number | undefined;
    let top: number | undefined;
    let bottom: number | undefined;
    let left: number | undefined;
    let right: number | undefined;
    let cursor = "ns-resize";
    const styleResizable = staticStyles();
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
      position: "absolute",
      width,
      height,
      top,
      bottom,
      left,
      right,
      cursor,
      zIndex: DefaultZIndex,
    };
  };

  const getResizeCornerStyleProps: (
    resizeDirection: IResizeDirection
  ) => React.CSSProperties = (resizeDirection: IResizeDirection) => {
    const width = resizeEdgeWidth;
    const height = resizeEdgeWidth;
    let top: number | undefined;
    let bottom: number | undefined;
    let left: number | undefined;
    let right: number | undefined;
    let cursor = "nesw-resize";
    switch (resizeDirection) {
      case "nw":
        top = -resizeEdgeWidth / 2;
        bottom = undefined;
        left = -resizeEdgeWidth / 2;
        right = undefined;
        cursor = "nwse-resize";
        break;
      case "ne":
        top = -resizeEdgeWidth / 2;
        bottom = undefined;
        left = undefined;
        right = -resizeEdgeWidth / 2;
        cursor = "nesw-resize";
        break;
      case "sw":
        top = undefined;
        bottom = -resizeEdgeWidth / 2;
        left = -resizeEdgeWidth / 2;
        right = undefined;
        cursor = "nesw-resize";
        break;
      case "se":
        top = undefined;
        bottom = -resizeEdgeWidth / 2;
        left = undefined;
        right = -resizeEdgeWidth / 2;
        cursor = "nwse-resize";
        break;
      default:
        break;
    }
    return {
      position: "absolute",
      width,
      height,
      top,
      bottom,
      left,
      right,
      cursor,
      zIndex: DefaultZIndex + 1,
    };
  };

  const renderResizableEdge = (resizeDirection: IResizeDirection) => {
    if (resizeDirections.includes(resizeDirection)) {
      return (
        <div
          key={resizeDirection}
          className="dnd-resizable-edge"
          onMouseDown={(event) => {
            event.stopPropagation();
            event.preventDefault();
            handleResizeStart(resizeDirection, event);
          }}
          style={{
            ...getResizeEdgeStyleProps(resizeDirection),
          }}
        />
      );
    }
    return null;
  };

  const renderResizableCorner = (resizeDirection: IResizeDirection) => {
    if (resizeDirections.includes(resizeDirection)) {
      return (
        <div
          key={resizeDirection}
          className="dnd-resizable-corner"
          onMouseDown={(event) => {
            event.stopPropagation();
            event.preventDefault();
            handleResizeStart(resizeDirection, event);
          }}
          style={{
            ...getResizeCornerStyleProps(resizeDirection),
          }}
        />
      );
    }
    return null;
  };

  if (
    dndSystemStateRef.current.draggingViewModels.reduce((accumulator, vm) => {
      if (vm.id === viewModalRef.current.id) {
        accumulator = true;
      }
      return accumulator;
    }, false)
  ) {
    domRef.current?.setAttribute("focused", "true");
  } else {
    domRef.current?.removeAttribute("focused");
  }

  if (dragState.isDragging) {
    return (
      <>
        <div className="dnd-resizable" style={draggedStyles()} {...otherProps}>
          {children}
        </div>
        <div
          tabIndex={0}
          className="dnd-resizable"
          ref={domRef}
          style={{ ...staticStyles(), opacity: 0.5 }}
          {...otherProps}
        >
          {children}
        </div>
      </>
    );
  } else {
    return (
      <div
        tabIndex={0}
        className="dnd-resizable"
        ref={domRef}
        onMouseDown={onMouseDown}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        style={staticStyles()}
        onClick={(event) =>
          domRef.current?.focus() && onFocus?.(event.shiftKey)
        }
        {...otherProps}
      >
        {DefaultEdgeDirections.map((resizeDirection) =>
          renderResizableEdge(resizeDirection)
        )}
        {DefaultCornerDirections.map((resizeDirection) =>
          renderResizableCorner(resizeDirection)
        )}
        {children}
      </div>
    );
  }
};

export default ResizableDnDView;
