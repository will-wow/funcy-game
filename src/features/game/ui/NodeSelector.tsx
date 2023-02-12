import clsx from "clsx";
import { ts } from "ts-morph";

import { setNodeToPlace, useNodeToPlace } from "$game/game.store";
import { getEmptyNode } from "$nodes/empty-node";
import { GameNode, NodeKind } from "$nodes/nodes";

export function NodeSelector() {
  const value = useNodeToPlace();

  return (
    <>
      <NodeSelectorButton
        selectedValue={value}
        value="FunctionDeclaration"
        label="Function"
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
        value="Identifier"
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

      {value && <NodeOptions node={value} />}
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
      onClick={() =>
        setNodeToPlace(isSelected ? null : getEmptyNode({ kind: value }))
      }
    >
      {label}
    </button>
  );
}

interface NodeOptionsProps {
  node: GameNode;
}

function NodeOptions({ node }: NodeOptionsProps) {
  switch (node.kind) {
    case "FunctionDeclaration": {
      return (
        <>
          <TextInput
            label="Name"
            value={node.name}
            onChange={(value) => setNodeToPlace({ ...node, name: value })}
          />
        </>
      );
    }
    case "Parameter": {
      return (
        <>
          <TextInput
            label="Name"
            value={node.name}
            onChange={(value) => setNodeToPlace({ ...node, name: value })}
          />

          <label>
            Type
            <select
              value={node.type}
              onChange={(e) =>
                setNodeToPlace({
                  ...node,
                  type: e.target.value as "number" | "boolean" | "string",
                })
              }
            >
              <option value="number">Number</option>
              <option value="string">String</option>
              <option value="boolean">Boolean</option>
            </select>
          </label>
        </>
      );
    }
    case "NumericLiteral": {
      return (
        <NumberInput
          label="Value"
          value={node.value}
          onChange={(value) => setNodeToPlace({ ...node, value })}
        />
      );
    }
    case "StringLiteral": {
      return (
        <TextInput
          label="Value"
          value={node.value}
          onChange={(value) => setNodeToPlace({ ...node, value })}
        />
      );
    }
    case "Identifier": {
      return (
        <>
          <TextInput
            label="Name"
            value={node.name}
            onChange={(value) => setNodeToPlace({ ...node, name: value })}
          />

          <label>
            Type
            <select
              value={node.type}
              onChange={(e) =>
                setNodeToPlace({
                  ...node,
                  type: e.target.value as
                    | "infer"
                    | "number"
                    | "boolean"
                    | "string",
                })
              }
            >
              <option value="infer">Infer</option>
              <option value="number">Number</option>
              <option value="string">String</option>
              <option value="boolean">Boolean</option>
            </select>
          </label>
        </>
      );
    }
    case "BinaryExpression": {
      return (
        <select
          onChange={(event) => {
            setNodeToPlace({
              ...node,
              operator: Number(event.target.value) as ts.BinaryOperator,
            });
          }}
        >
          {[
            ts.SyntaxKind.PlusToken,
            ts.SyntaxKind.MinusToken,
            ts.SyntaxKind.AsteriskToken,
            ts.SyntaxKind.SlashToken,
            ts.SyntaxKind.GreaterThanToken,
            ts.SyntaxKind.GreaterThanEqualsToken,
            ts.SyntaxKind.LessThanToken,
            ts.SyntaxKind.LessThanEqualsToken,
            ts.SyntaxKind.EqualsEqualsEqualsToken,
            ts.SyntaxKind.AmpersandAmpersandToken,
            ts.SyntaxKind.BarBarToken,
            ts.SyntaxKind.PercentToken,
            ts.SyntaxKind.AsteriskAsteriskToken,
          ].map((token) => (
            <option key={token} value={token}>
              {ts.tokenToString(token)}
            </option>
          ))}
        </select>
      );
    }
    default: {
      return null;
    }
  }
}

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}
function TextInput({ label, value, onChange }: TextInputProps) {
  return (
    <label>
      {label}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}
function NumberInput({ label, value, onChange }: NumberInputProps) {
  return (
    <label>
      {label}
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
