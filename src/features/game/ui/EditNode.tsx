import { useState } from "react";
import { ts } from "ts-morph";

import {
  updateSelectedNode,
  useNodesOfType,
  useSelectedNode,
} from "$game/game.store";
import {
  CallExpressionGameNode,
  FunctionDeclarationGameNode,
  GameNode,
  IdentifierGameNode,
  NullableNodeId,
} from "$nodes/nodes";

interface EditSelectedNodeProps {
  className?: string;
}

export function EditSelectedNode({ className }: EditSelectedNodeProps) {
  const selectedNode = useSelectedNode();

  if (!selectedNode) return null;

  function handleChange(partial: Partial<GameNode>) {
    updateSelectedNode(partial);
  }

  return (
    <div className={className}>
      <div>
        <h2>Editing {selectedNode.kind}</h2>
      </div>
      <EditNode node={selectedNode} onChange={handleChange} />
    </div>
  );
}

interface EditNodeProps {
  node: GameNode;
  onChange: (node: Partial<GameNode>) => void;
}

function EditNode({ node, onChange }: EditNodeProps) {
  switch (node.kind) {
    case "FunctionDeclaration": {
      return (
        <TextInput
          label="Name"
          value={node.name}
          onChange={(value) => onChange({ ...node, name: value })}
        />
      );
    }
    case "Identifier": {
      return (
        <FunctionReferenceOptions
          node={node}
          label="Reference"
          onChange={(inputId) => {
            onChange({
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
            onChange={(value) => onChange({ ...node, name: value })}
          />

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

          <label>
            Array
            <input
              type="checkbox"
              checked={node.array}
              onChange={(e) => onChange({ ...node, array: e.target.checked })}
            />
          </label>
        </>
      );
    }
    case "NumericLiteral": {
      return (
        <NumberInput
          label="Value"
          value={node.value}
          onChange={(value) => onChange({ ...node, value })}
        />
      );
    }
    case "StringLiteral": {
      return (
        <TextInput
          label="Value"
          value={node.value}
          onChange={(value) => onChange({ ...node, value })}
        />
      );
    }
    case "VariableStatement": {
      return (
        <>
          <TextInput
            label="Name"
            value={node.name}
            onChange={(value) => onChange({ ...node, name: value })}
          />

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
        <label>
          Operator
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
        </label>
      );
    }
    case "ReturnStatement": {
      return (
        <>
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
          <label>
            Array
            <input
              type="checkbox"
              checked={node.array}
              onChange={(e) => onChange({ ...node, array: e.target.checked })}
            />
          </label>
        </>
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
