import { ts } from "ts-morph";

export type NodeId = string;

export type NodeKind = keyof typeof ts.SyntaxKind;

export type NullableNodeId = NodeId | null;

export interface BaseGameNode {
  id: NodeId;
  kind: NodeKind;
  x: number;
  y: number;
}

/** Variables and parameters, that can have multiple outputs */
export interface BaseVariableGameNode extends BaseGameNode {
  outputs: NodeId[];
}

/** Expressions with one output */
export interface BaseExpressionGameNode extends BaseGameNode {
  output: NullableNodeId;
}

/** Nodes with inputs. The actual node type should be a tuple of NullableNodeIds */
export interface BaseCalculatedGameNode extends BaseGameNode {
  inputs: NullableNodeId[];
}

/** A function parameter, with many outputs. */
export interface ParameterGameNode extends BaseVariableGameNode {
  kind: "Parameter";
  name: string;
  type: "number" | "string" | "boolean";
}

/** A variable, with one input and many outputs. */
export interface VariableGameNode extends BaseVariableGameNode {
  kind: "Identifier";
  name: string;
  type: "infer" | "number" | "string" | "boolean";
  inputs: [NullableNodeId];
}

/** The return statement, which has no output. */
export interface ReturnStatementGameNode extends BaseGameNode {
  kind: "ReturnStatement";
  inputs: [NullableNodeId];
}

export interface BinaryExpressionGameNode extends BaseExpressionGameNode {
  kind: "BinaryExpression";
  operator: ts.BinaryOperator;
  inputs: [left: NullableNodeId, right: NullableNodeId];
}

export interface ConditionalExpressionGameNode extends BaseExpressionGameNode {
  kind: "ConditionalExpression";
  inputs: [
    condition: NullableNodeId,
    whenTrue: NullableNodeId,
    whenFalse: NullableNodeId
  ];
}

export interface NumericLiteralGameNode extends BaseExpressionGameNode {
  kind: "NumericLiteral";
  value: number;
}

export interface StringLiteralGameNode extends BaseExpressionGameNode {
  kind: "StringLiteral";
  value: string;
}

export interface CallExpressionGameNode extends BaseExpressionGameNode {
  kind: "CallExpression";
  moduleName?: string;
  functionName: string;
  /** params */
  inputs: NodeId[];
}

export type GameNode =
  | BinaryExpressionGameNode
  | CallExpressionGameNode
  | ConditionalExpressionGameNode
  | NumericLiteralGameNode
  | ParameterGameNode
  | ReturnStatementGameNode
  | StringLiteralGameNode
  | VariableGameNode;

export function isExpressionNode(node: any): node is BaseExpressionGameNode {
  return "output" in node;
}

export function isVariableNode(node: any): node is BaseVariableGameNode {
  return "outputs" in node;
}

export function isCalculatedNode(node: any): node is BaseCalculatedGameNode {
  return "inputs" in node;
}
