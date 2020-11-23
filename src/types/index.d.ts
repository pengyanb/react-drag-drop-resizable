/// <reference path="../index.d.ts" />
// @ts-ignore
declare module "*.scss";

type IResizeDirection = "n" | "s" | "w" | "e" | "nw" | "ne" | "sw" | "se";

interface IDndViewModel {
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
  viewModals: IDndViewModel[];
  pos: I2DCoordinate;
  translation: I2DCoordinate;
  mouseDownAtViewPos: I2DCoordinate;
  toViewModal?: IDndViewModel | null;
}

interface IResizeInfo {
  width: string | number | undefined;
  height: string | number | undefined;
  resizeDirection?: IResizeDirection;
  dx?: number;
  dy?: number;
}

interface IDraggingInfo {
  viewModals: IDndViewModel[];
  translation: I2DCoordinate;
}

type ICanDropFilter = (
  viewModalsToDrop: IDndViewModel[],
  toViewModal: IDndViewModel | undefined | null
) => boolean;
interface IResizableDnDProps {
  viewModal: IDndViewModel;
  resizeHandler: (viewModal: IDndViewModel, resizeInfo: IResizeInfo) => void;
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
