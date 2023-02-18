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
      startZ={startNode.y}
      endX={endNode.x}
      endY={endZ}
      endZ={endNode.y}
      color={color}
      onClick={onClick}
    />
  );
}

export interface ConnectionProps {
  startX: number;
  startZ: number;
  endX: number;
  endZ: number;
  endY?: number;
  color: string;
  inputIndex?: number;
  onClick?: () => void;
}

export function Connection({
  startX,
  startZ,
  endX,
  endY = 0.25,
  endZ,
  color,
  onClick,
}: ConnectionProps) {
  const minX = Math.min(startX, endX);
  const minY = Math.min(startZ, endZ);
  const maxX = Math.max(startX, endX);
  const maxY = Math.max(startZ, endZ);

  const xLength = maxX - minX;
  const zLength = maxY - minY;

  const xDirection = startX < endX ? 1 : -1;
  const zDirection = startZ > endZ ? 1 : -1;

  // Angle in radians to rotate the line
  const angle = Math.atan2(zLength * zDirection, xLength * xDirection);

  const startPoint = new Vector3(startX, 0.25, startZ);
  const endPoint = new Vector3(endX, endY, endZ);

  const length = startPoint.distanceTo(endPoint);

  return (
    <group
      position={[(startX + endX) / 2, (0.25 + endY) / 2, (startZ + endZ) / 2]}
      rotation={[0, angle, endY ? Math.asin((endY - 0.25) / length) : 0]}
    >
      <mesh rotation={[NINETY_DEGREES, 0, NINETY_DEGREES]} onClick={onClick}>
        <cylinderGeometry args={[0.1, 0.02, length]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}
