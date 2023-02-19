import { ts } from "ts-morph";

export type NodeId = string;

export type SyntaxKindName = keyof typeof ts.SyntaxKind;

export type NullableNodeId = NodeId | null;

export type GameNodes = Record<string, GameNode>;

export interface BaseGameNode {
  /** Unique ID */
  id: NodeId;
  /** SyntaxKind */
  kind: SyntaxKindName;
  /** x position on the game board. */
  x: number;
  /** y position on the game board */
  y: number;
}

type RequiredNodeType = "number" | "string" | "boolean";
type NodeType = "infer" | RequiredNodeType;

export interface TypedGameNode {
  type: NodeType;
  array: boolean;
}

export interface RequiredTypedGameNode extends TypedGameNode {
  type: RequiredNodeType;
}

/** Variables and parameters, that can have multiple outputs */
export interface BaseVariableGameNode extends BaseGameNode {
  /** List of nodes this variable is used in. */
  outputs: NodeId[];
}

/** Expressions with one output */
export interface BaseExpressionGameNode extends BaseGameNode {
  /** Output this expression sends data to. */
  output: NullableNodeId;
}

/** Nodes with inputs. The actual node type should be a tuple of NullableNodeIds */
export interface BaseCalculatedGameNode extends BaseGameNode {
  /** Tuple of expressions that feed into this node. */
  inputs: NullableNodeId[];
}

/** A function parameter, with many outputs. */
export interface FunctionDeclarationGameNode extends BaseGameNode {
  kind: "FunctionDeclaration";
  name: string;
  width: number;
  height: number;
}

/** A function parameter, with many outputs. */
export interface ParameterGameNode
  extends BaseVariableGameNode,
    RequiredTypedGameNode {
  kind: "Parameter";
  name: string;
  array: boolean;
}

/** A variable, with one input and many outputs. */
export interface VariableGameNode extends BaseVariableGameNode, TypedGameNode {
  kind: "VariableStatement";
  name: string;
  array: boolean;
  inputs: [NullableNodeId];
}

export interface ElementAccessExpressionGameNode
  extends BaseExpressionGameNode {
  kind: "ElementAccessExpression";
  inputs: [object: NullableNodeId, key: NullableNodeId];
}

/** A reference to an external function/value */
export interface IdentifierGameNode extends BaseExpressionGameNode {
  kind: "Identifier";
  inputs: [NullableNodeId];
}

/** The return statement, which has no output. */
export interface ReturnStatementGameNode extends BaseGameNode, TypedGameNode {
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
  /** params */
  inputs: NullableNodeId[];
}

export type GameNode =
  | FunctionDeclarationGameNode
  | BinaryExpressionGameNode
  | CallExpressionGameNode
  | ConditionalExpressionGameNode
  | NumericLiteralGameNode
  | ParameterGameNode
  | ElementAccessExpressionGameNode
  | ReturnStatementGameNode
  | StringLiteralGameNode
  | VariableGameNode
  | ElementAccessExpressionGameNode
  | IdentifierGameNode;

export type NodeKind = GameNode["kind"];

export function isExpressionNode(node: any): node is BaseExpressionGameNode {
  return "output" in node;
}

export function isVariableNode(node: any): node is BaseVariableGameNode {
  return "outputs" in node;
}

export function isCalculatedNode(node: any): node is BaseCalculatedGameNode {
  return "inputs" in node;
}

export function isCallNode(node: any): node is CallExpressionGameNode {
  return node.kind === "CallExpression";
}

export function isTypedNode(node: any): node is TypedGameNode {
  return "type" in node;
}

export function isFunctionNode(
  node: GameNode
): node is FunctionDeclarationGameNode {
  return node.kind === "FunctionDeclaration";
}

export function assertNodeIsKind<T extends GameNode>(
  node: GameNode | undefined,
  kind: T["kind"][]
): asserts node is T {
  if (!node) {
    throw new Error(
      `Expected node to be of kind ${kind.join(", ")}, but it was undefined`
    );
  }
  if (!kind.includes(node.kind)) {
    throw new Error(
      `Expected node to be of kind ${kind.join(", ")}, but it was ${node.kind}`
    );
  }
}
