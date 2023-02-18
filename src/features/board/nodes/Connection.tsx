import { Vector3 } from "three";

import { GameNode, isCalculatedNode } from "$nodes/nodes";
import { NINETY_DEGREES } from "$three/rotations";

interface ConnectionToNodeProps {
  startNode: GameNode;
  endNode: GameNode;
  color: string;
  onClick?: () => void;
}

export function ConnectionToNode({
  startNode,
  endNode,
  color,
  onClick,
}: ConnectionToNodeProps) {
  const indexOfInput = isCalculatedNode(endNode)
    ? endNode.inputs.indexOf(startNode.id)
    : 0;

  const endZ = indexOfInput === 0 ? undefined : indexOfInput + 1;

  return (
    <Connection
      startX={startNode.x}
      startY={startNode.y}
      endX={endNode.x}
      endY={endNode.y}
      endZ={endZ}
      color={color}
      onClick={onClick}
    />
  );
}

export interface ConnectionProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  endZ?: number;
  color: string;
  inputIndex?: number;
  onClick?: () => void;
}

export function Connection({
  startX,
  startY,
  endX,
  endY,
  endZ = 0.25,
  color,
  onClick,
}: ConnectionProps) {
  const minX = Math.min(startX, endX);
  const minY = Math.min(startY, endY);
  const maxX = Math.max(startX, endX);
  const maxY = Math.max(startY, endY);

  const xLength = maxX - minX;
  const yLength = maxY - minY;

  const xDirection = startX < endX ? 1 : -1;
  const yDirection = startY > endY ? 1 : -1;

  // Angle in radians to rotate the line
  const angle = Math.atan2(yLength * yDirection, xLength * xDirection);

  const startPoint = new Vector3(startX, 0.25, startY);
  const endPoint = new Vector3(endX, endZ, endY);

  const length = startPoint.distanceTo(endPoint);

  return (
    <group
      position={[(startX + endX) / 2, (0.25 + endZ) / 2, (startY + endY) / 2]}
      rotation={[0, angle, endZ ? Math.asin((endZ - 0.25) / length) : 0]}
    >
      <mesh rotation={[NINETY_DEGREES, 0, NINETY_DEGREES]} onClick={onClick}>
        <cylinderGeometry args={[0.1, 0.1, length]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}
