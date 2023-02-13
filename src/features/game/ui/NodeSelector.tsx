import clsx from "clsx";

import { setMode, setNodeToPlace, useNodeToPlace } from "$game/game.store";
import { getEmptyNode } from "$nodes/empty-node";
import { GameNode, NodeKind } from "$nodes/nodes";

export function NodeSelector() {
  const value = useNodeToPlace();

  return (
    <>
      <NodeSelectorButton
        selectedValue={value}
        value="FunctionDeclaration"
        label="New Function"
      />
      <NodeSelectorButton
        selectedValue={value}
        value="ReturnStatement"
        label="Return"
      />
      <NodeSelectorButton
        selectedValue={value}
        value="CallExpression"
        label="Call Function"
      />
      <NodeSelectorButton
        selectedValue={value}
        value="Identifier"
        label="Identifier"
      />
      <NodeSelectorButton
        selectedValue={value}
        value="ElementAccessExpression"
        label="Property"
      />
      <NodeSelectorButton
        selectedValue={value}
        value="NumericLiteral"
        label="Number"
      />
      <NodeSelectorButton
        selectedValue={value}
        value="StringLiteral"
        label="String"
      />
      <NodeSelectorButton
        selectedValue={value}
        value="Parameter"
        label="Parameter"
      />
      <NodeSelectorButton
        selectedValue={value}
        value="VariableStatement"
        label="Variable"
      />
      <NodeSelectorButton
        selectedValue={value}
        value="BinaryExpression"
        label="Binary Expression"
      />
      <NodeSelectorButton
        selectedValue={value}
        value="ConditionalExpression"
        label="IF"
      />
    </>
  );
}

interface NodeSelectorButtonProps {
  selectedValue: GameNode | null;
  value: NodeKind;
  label: string;
}

function NodeSelectorButton({
  selectedValue,
  value,
  label,
}: NodeSelectorButtonProps) {
  const isSelected = value === selectedValue?.kind;
  return (
    <button
      className={clsx(
        isSelected ? "border-blue-700" : "border-white",
        "border"
      )}
      onClick={() => {
        setNodeToPlace(isSelected ? null : getEmptyNode({ kind: value }));
        setMode("place");
      }}
    >
      {label}
    </button>
  );
}
