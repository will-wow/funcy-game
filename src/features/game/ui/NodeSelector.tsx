import clsx from "clsx";
import { useState } from "react";
import { ts } from "ts-morph";

import {
  setNodeToPlace,
  useNodesOfType,
  useNodeToPlace,
} from "$game/game.store";
import { getEmptyNode } from "$nodes/empty-node";
import {
  CallExpressionGameNode,
  FunctionDeclarationGameNode,
  GameNode,
  IdentifierGameNode,
  NodeKind,
  NullableNodeId,
} from "$nodes/nodes";

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
        value="PropertyAccessExpression"
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
        <TextInput
          label="Name"
          value={node.name}
          onChange={(value) => setNodeToPlace({ ...node, name: value })}
        />
      );
    }
    case "CallExpression": {
      return (
        <FunctionReferenceOptions
          node={node}
          label="Function"
          onChange={(inputId) => {
            setNodeToPlace({
              ...node,
              inputs: [inputId, ...node.inputs.slice(1)],
            });
          }}
        />
      );
    }
    case "Identifier": {
      return (
        <FunctionReferenceOptions
          node={node}
          label="Reference"
          onChange={(inputId) => {
            setNodeToPlace({
              ...node,
              inputs: [inputId],
            });
          }}
        />
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
    case "PropertyAccessExpression": {
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
    case "VariableStatement": {
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
  const [isZero, setIsZero] = useState(false);

  return (
    <label>
      {label}
      <input
        type="text"
        value={value || (isZero ? "0" : "")}
        onChange={(e) => {
          setIsZero(e.target.value === "0");
          onChange(Number(e.target.value || 0));
        }}
      />
    </label>
  );
}

interface FunctionReferenceOptionsProps<
  T extends CallExpressionGameNode | IdentifierGameNode
> {
  label: string;
  node: T;
  onChange: (node: NullableNodeId) => void;
}

function FunctionReferenceOptions<
  T extends CallExpressionGameNode | IdentifierGameNode
>({ node, label, onChange }: FunctionReferenceOptionsProps<T>) {
  const functions = useNodesOfType<FunctionDeclarationGameNode>(
    "FunctionDeclaration"
  ).filter((fn) => fn.id !== node.id);

  return (
    <label>
      {label}
      <select
        value={node.inputs[0] || ""}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select a function</option>

        {functions.map((fn) => (
          <option key={fn.id} value={fn.id}>
            {fn.name}
          </option>
        ))}
      </select>
    </label>
  );
}
