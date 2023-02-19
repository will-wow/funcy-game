import { GameNode, isCalculatedNode } from "$nodes/nodes";
import { mapN } from "$utils/numericIterators";
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

  // Don't render inputs if there's only the base input.
  if (node.inputs.length <= 1) return null;

  return (
    <RenderArbitraryInputs
      color={color}
      onHover={onHover}
      onClick={onClick}
      inputCount={node.inputs.length - 1}
    />
  );
}

interface RenderArbitraryInputsProps extends Omit<RenderInputsProps, "node"> {
  inputCount: number;
}

export function RenderArbitraryInputs({
  color,
  onHover,
  onClick,
  inputCount,
}: RenderArbitraryInputsProps) {
  return (
    <>
      {mapN(inputCount, (index) => (
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

function RenderInput({ index, color, onHover, onClick }: RenderInputProps) {
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
