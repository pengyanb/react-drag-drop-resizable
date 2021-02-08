/// <reference path="../index.d.ts" />
// @ts-ignore
declare module "*.scss";

type IResizeDirection = "n" | "s" | "w" | "e" | "nw" | "ne" | "sw" | "se";

interface IRDndViewModel {
  id: string;
  style: React.CSSProperties;
  [key: string]: any;
  viewRef?: React.MutableRefObject<HTMLElement | null>;
}

interface I2DCoordinate {
  x: number;
  y: number;
}

interface IDropInfo {
  viewModals: IRDndViewModel[];
  pos: I2DCoordinate;
  translation: I2DCoordinate;
  mouseDownAtViewPos: I2DCoordinate;
  toViewModal?: IRDndViewModel | null;
}

interface IResizeInfo {
  width: string | number | undefined;
  height: string | number | undefined;
  resizeDirection?: IResizeDirection;
  dx?: number;
  dy?: number;
}

interface IDraggingInfo {
  viewModals: IRDndViewModel[];
  translation: I2DCoordinate;
}

type ICanDropFilter = (
  viewModalsToDrop: IRDndViewModel[],
  toViewModal: IRDndViewModel | undefined | null
) => boolean;
interface IRDnDProps {
  viewModal: IRDndViewModel;
  resizeHandler: (viewModal: IRDndViewModel, resizeInfo: IResizeInfo) => void;
  dropHandler: (dropInfo: IDropInfo) => void;
  onDrag?: (draggingInfo: IDraggingInfo) => void;
  onDragEnd?: (dragEndInfo: IDragEndInfo) => void;
  onFocus?: (shiftPressed?: boolean = false) => void;
  resizeEdgeWidth?: number;
  resizeDirections?: IResizeDirection[];
  style?: React.CSSProperties;
  children?: React.ReactNode;
  refToForward?: (element: React.MutableRefObject<HTMLElement | null>) => void;
  [key: string]: any;
}

interface IRDnDCanvasProps {
  style?: React.CSSProperties;
  children?: React.ReactNode;
  [key: string]: any;
}
