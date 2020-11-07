/// <reference path="../index.d.ts" />
// @ts-ignore
declare module "*.scss";

type IResizeDirection = "n" | "s" | "w" | "e" | "nw" | "ne" | "sw" | "se";

interface IResizableProps {
  onResizing: (newSize: {
    width: string | number;
    height: string | number;
  }) => void;
  width?: string | number;
  height?: string | number;
  resizeEdgeWidth?: number;
  resizeDirections?: IResizeDirection[];
  proportional?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
