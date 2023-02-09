export interface ConnectionProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
}

export function Connection({
  startX,
  startY,
  endX,
  endY,
  color,
}: ConnectionProps) {
  const minX = Math.min(startX, endX);
  const minY = Math.min(startY, endY);
  const maxX = Math.max(startX, endX);
  const maxY = Math.max(startY, endY);

  const xLength = maxX - minX;
  const yLength = maxY - minY;

  const xDirection = startX < endX ? 1 : -1;
  const yDirection = startY > endY ? 1 : -1;

  const fullLength = Math.sqrt(xLength * xLength + yLength * yLength);

  const centerX = minX + xLength / 2;
  const centerY = minY + yLength / 2;

  // Angle in radians to rotate the line
  const angle = Math.atan2(yLength * yDirection, xLength * xDirection);

  return (
    <mesh position={[centerX, 0.05, centerY]} rotation={[0, angle, 0]}>
      <boxGeometry args={[fullLength, 0.1, 0.25]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
