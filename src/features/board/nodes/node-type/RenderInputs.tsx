import { GameNode, isCalculatedNode } from "$nodes/nodes";
import { stopPropagation } from "$utils/utils";

import { OnNodeCallback } from "./RenderNodeProps";

export interface RenderInputsProps {
  node: GameNode;
  color?: string;
  onHover: OnNodeCallback;
  onClick: OnNodeCallback;
}

export function RenderInputs({
  node,
  color,
  onHover,
  onClick,
}: RenderInputsProps) {
  if (!isCalculatedNode(node)) return null;

  return (
    <>
      {new Array(node.inputs.length - 1).fill(0).map((_, index) => (
        <RenderInput
          key={index}
          index={index + 1}
          color={color}
          onHover={onHover}
          onClick={onClick}
        />
      ))}
    </>
  );
}

interface RenderInputProps {
  index: number;
  color?: string;
  onHover: OnNodeCallback;
  onClick: OnNodeCallback;
}

function RenderInput({
  index,
  color,
  onHover,
  onClick,
}: RenderInputProps) {
  return (
    <group position={[0, index, 0]}>
      {/* Pole */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.1, 1, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Connector */}
      <mesh
        position={[0, 1, 0]}
        onPointerMove={stopPropagation}
        onPointerEnter={(e) => {
          onHover(e, index + 1);
        }}
        onClick={(e) => {
          onClick(e, index);
        }}
      >
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}
