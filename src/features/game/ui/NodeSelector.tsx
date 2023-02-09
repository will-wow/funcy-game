import clsx from "clsx";
import { ts } from "ts-morph";

import { getEmptyNode } from "$nodes/empty-node";
import { GameNode, NodeKind } from "$nodes/nodes";

interface NodeSelectorProps {
  className?: string;
  value: GameNode | null;
  onChange: (value: GameNode | null) => void;
}

export function NodeSelector({ value, onChange }: NodeSelectorProps) {
  return (
    <>
      <NodeSelectorButton
        selectedValue={value}
        value="NumericLiteral"
        label="Number"
        onChange={onChange}
      />
      <NodeSelectorButton
        selectedValue={value}
        value="StringLiteral"
        label="String"
        onChange={onChange}
      />
      <NodeSelectorButton
        selectedValue={value}
        value="Parameter"
        label="Parameter"
        onChange={onChange}
      />
      <NodeSelectorButton
        selectedValue={value}
        value="Identifier"
        label="Variable"
        onChange={onChange}
      />
      <NodeSelectorButton
        selectedValue={value}
        value="BinaryExpression"
        label="Binary Expression"
        onChange={onChange}
      />
      <NodeSelectorButton
        selectedValue={value}
        value="ConditionalExpression"
        label="IF"
        onChange={onChange}
      />

      {value && <NodeOptions node={value} onChange={onChange} />}
    </>
  );
}

interface NodeSelectorButtonProps {
  selectedValue: GameNode | null;
  value: NodeKind;
  label: string;
  onChange: (value: GameNode | null) => void;
}

function NodeSelectorButton({
  selectedValue,
  value,
  label,
  onChange,
}: NodeSelectorButtonProps) {
  const isSelected = value === selectedValue?.kind;
  return (
    <button
      className={clsx(
        isSelected ? "border-blue-700" : "border-white",
        "border"
      )}
      onClick={() => onChange(isSelected ? null : getEmptyNode(value))}
    >
      {label}
    </button>
  );
}

interface NodeOptionsProps {
  node: GameNode;
  onChange: (value: GameNode) => void;
}

function NodeOptions({ node, onChange }: NodeOptionsProps) {
  switch (node.kind) {
    case "Parameter": {
      return (
        <>
          <label>
            Name
            <input
              type="text"
              value={node.name}
              onChange={(e) => onChange({ ...node, name: e.target.value })}
            />
          </label>

          <label>
            Type
            <select
              value={node.type}
              onChange={(e) =>
                onChange({
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
        <input
          type="number"
          value={node.value}
          onChange={(e) => onChange({ ...node, value: Number(e.target.value) })}
        />
      );
    }
    case "StringLiteral": {
      return (
        <input
          type="text"
          value={node.value}
          onChange={(e) => onChange({ ...node, value: e.target.value })}
        />
      );
    }
    case "Identifier": {
      return (
        <>
          <label>
            Name
            <input
              type="text"
              value={node.name}
              onChange={(e) => onChange({ ...node, name: e.target.value })}
            />
          </label>

          <label>
            Type
            <select
              value={node.type}
              onChange={(e) =>
                onChange({
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
            onChange({
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
