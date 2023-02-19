import { GroupProps, ThreeEvent } from "@react-three/fiber";

import { GameNode } from "$nodes/nodes";

export type OnNodeCallback = (
  e: ThreeEvent<MouseEvent>,
  inputIndex: number
) => void;

export interface RenderNodeProps<T extends GameNode = GameNode>
  extends Omit<GroupProps, "position" | "rotation" | "onClick"> {
  node: T;
  x: number;
  y: number;
  color?: string;
  onClick?: OnNodeCallback;
  onHover?: OnNodeCallback;
}
