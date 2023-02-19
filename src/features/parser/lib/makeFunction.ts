/* eslint-disable no-console */
import { ts } from "ts-morph";

import { getNodesInFunction, getParamsForFunction } from "$nodes/functions";
import {
  GameNode,
  NodeId,
  NullableNodeId,
  VariableGameNode,
  isCalculatedNode,
  isExpressionNode,
  FunctionDeclarationGameNode,
  assertNodeIsKind,
  GameNodes,
  ReturnStatementGameNode,
  isTypedNode,
} from "$nodes/nodes";
import { assert } from "$utils/utils";

function countReferences(nodes: Record<NodeId, GameNode>): ReferenceCounts {
  const referenceCounts: ReferenceCounts = {};
  Object.values(nodes).forEach((node) => {
    if (!isCalculatedNode(node)) return;
    node.inputs.forEach((input) => {
      assert(input, "Can't count references with null input");

      if (nodes[input]?.kind === "VariableStatement") {
        referenceCounts[input] = (referenceCounts[input] || 0) + 1;
      }
    });
  });
  return referenceCounts;
}

function usedReferences(
  nodes: Record<string, GameNode>,
  referenceCounts: ReferenceCounts
) {
  const usedReferenceId = Object.keys(referenceCounts).find(
    (id) => referenceCounts[id] === 0
  );
  if (!usedReferenceId) {
    console.error(
      referenceCounts,
      Object.keys(referenceCounts).map((id) => nodes[id])
    );
    throw new Error("No reference found with 0 references");
  }

  delete referenceCounts[usedReferenceId];

  return usedReferenceId;
}

function parse(
  nodesInFunction: GameNodes,
  nodes: GameNodes,
  returnNode: ReturnStatementGameNode
): ts.Statement[] {
  const referenceCounts = countReferences(nodesInFunction);
  const returnExpression = parseNodeAndOutputs(
    nodes,
    returnNode,
    referenceCounts
  );

  const statements: ts.Statement[] = [
    ts.factory.createReturnStatement(returnExpression),
  ];

  while (true) {
    if (Object.keys(referenceCounts).length === 0) {
      break;
    }

    const usedReferenceId = usedReferences(nodes, referenceCounts);
    const node = nodes[usedReferenceId] as VariableGameNode;

    const type = getTypeOfNode(node);

    const [inputId] = node.inputs;
    assert(inputId, "Variable node has no input");

    statements.push(
      ts.factory.createVariableStatement(
        undefined,
        ts.factory.createVariableDeclarationList(
          [
            ts.factory.createVariableDeclaration(
              node.name,
              undefined,
              type,
              parseNodeAndInputs(nodes, nodes[inputId], referenceCounts)
            ),
          ],
          ts.NodeFlags.Const
        )
      )
    );
  }

  return statements.reverse();
}

/** Parse a node, and also parse any of its outputs to walk the whole tree. */
function parseNodeAndOutputs(
  nodes: Record<NodeId, GameNode>,
  node: GameNode,
  referenceCounts: ReferenceCounts,
  outputId?: NodeId
): ts.Expression {
  // Start by parsing the current node.
  const newTree = parseNodeAndInputs(nodes, node, referenceCounts);

  // Don't look for an output if there isn't none.
  // This is the end for returns.
  if (!isExpressionNode(node)) return newTree;

  // If there should be an output but it's not connected, that's an error.
  assert(node.output, `Node ${node.kind} has no output`);

  // When you get to the node that outputs to return, stop.
  // This lets the calling function wrap a return statement around the expression.
  if (node.output === "return" || node.output === outputId) {
    return newTree;
  }

  // Parse the output node, passing in the current node as the input.
  return parseNodeAndInputs(nodes, nodes[node.output], referenceCounts, {
    parsedNodeId: node.id,
    expression: newTree,
  });
}

/** A parsed expression, with the ID of the node that was parsed. */
interface ParsedTree {
  parsedNodeId: NodeId;
  expression: ts.Expression;
}

/** Parse a branch, which may have already been parsed. */
function parseBranch(
  nodes: Record<NodeId, GameNode>,
  /** Output ID of the current node being processed */
  outputId: NodeId,
  /** ID of the input node to be parsed. */
  expectedInputId: NullableNodeId,
  referenceCounts: ReferenceCounts,
  /** The parsed current input, which may be used in this branch. */
  possibleInputTree?: ParsedTree
) {
  assert(expectedInputId, "Expected input ID");

  if (possibleInputTree && expectedInputId === possibleInputTree.parsedNodeId) {
    return possibleInputTree.expression;
  }

  const node = nodes[expectedInputId];

  return parseNodeAndOutputs(nodes, node, referenceCounts, outputId);
}

type ReferenceCounts = Record<NodeId, number>;

function noteReference(id: string, referenceCounts: ReferenceCounts) {
  // If the reference is don't, we're parsing the assignment, so ignore it.
  if (referenceCounts[id]) {
    // Decrement a used reference
    referenceCounts[id]--;
  }
  return referenceCounts;
}

/**
 * Parse a node, and all of its inputs.
 * Optionally takes an already parsed input
 */
function parseNodeAndInputs(
  /** Table of all nodes */
  nodes: Record<NodeId, GameNode>,
  /** The current node */
  node: GameNode,
  referenceCounts: ReferenceCounts,
  /** The tree of the last node parsed */
  inputTree?: ParsedTree
): ts.Expression {
  /** The ID of this node, to be used as the output to other branches. */
  const outputId = node.id;
  switch (node.kind) {
    case "Parameter": {
      return ts.factory.createIdentifier(node.name);
    }
    case "VariableStatement": {
      noteReference(node.id, referenceCounts);
      return ts.factory.createIdentifier(node.name);
    }
    case "ElementAccessExpression": {
      const [object, property] = node.inputs;

      assert(!!property, "ElementAccessExpression does not have a property");

      const propertyNode = nodes[property];

      if (propertyNode.kind === "StringLiteral") {
        return ts.factory.createPropertyAccessExpression(
          parseBranch(nodes, outputId, object, referenceCounts, inputTree),
          propertyNode.value
        );
      } else {
        return ts.factory.createElementAccessExpression(
          parseBranch(nodes, outputId, object, referenceCounts, inputTree),
          parseBranch(nodes, outputId, property, referenceCounts, inputTree)
        );
      }
    }
    case "Identifier": {
      const [nodeId] = node.inputs;
      assert(nodeId, "Identifier does not have an input");
      const inputNode = nodes[nodeId];
      assertNodeIsKind<FunctionDeclarationGameNode>(inputNode, [
        "FunctionDeclaration",
      ]);
      return ts.factory.createIdentifier(inputNode.name);
    }
    case "CallExpression":
    case "NewExpression": {
      const [functionNodeId, ...args] = node.inputs;
      assert(functionNodeId, "CallExpression does not have a function");

      const creator =
        node.kind === "CallExpression"
          ? ts.factory.createCallExpression
          : ts.factory.createNewExpression;

      return creator(
        parseBranch(
          nodes,
          outputId,
          functionNodeId,
          referenceCounts,
          inputTree
        ),
        undefined,
        args.map((inputId) => {
          return parseBranch(
            nodes,
            outputId,
            inputId,
            referenceCounts,
            inputTree
          );
        })
      );
    }
    case "BinaryExpression": {
      const {
        operator,
        inputs: [left, right],
      } = node;
      return ts.factory.createBinaryExpression(
        parseBranch(nodes, outputId, left, referenceCounts, inputTree),
        operator,
        parseBranch(nodes, outputId, right, referenceCounts, inputTree)
      );
    }
    case "ConditionalExpression": {
      const [condition, whenTrue, whenFalse] = node.inputs;
      return ts.factory.createConditionalExpression(
        parseBranch(nodes, outputId, condition, referenceCounts, inputTree),
        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
        parseBranch(nodes, outputId, whenTrue, referenceCounts, inputTree),
        ts.factory.createToken(ts.SyntaxKind.ColonToken),
        parseBranch(nodes, outputId, whenFalse, referenceCounts, inputTree)
      );
    }
    case "NumericLiteral": {
      return ts.factory.createNumericLiteral(node.value);
    }
    case "StringLiteral": {
      return ts.factory.createStringLiteral(node.value);
    }
    case "ReturnStatement": {
      const [input] = node.inputs;
      assert(input, "Return statement has no input");
      return parseNodeAndInputs(nodes, nodes[input], referenceCounts);
    }
    case "GlobalThis": {
      return ts.factory.createIdentifier("globalThis");
    }
    default: {
      throw new Error(`Unknown node kind, ${node.kind}`);
    }
  }
}

function getKeywordType(
  type: "infer" | "string" | "number" | "boolean"
): ts.KeywordTypeSyntaxKind | undefined {
  switch (type) {
    case "infer":
      return undefined;
    case "string":
      return ts.SyntaxKind.StringKeyword;
    case "number":
      return ts.SyntaxKind.NumberKeyword;
    case "boolean":
      return ts.SyntaxKind.BooleanKeyword;
    default:
      throw new Error(`Unknown type ${type}`);
  }
}

function getTypeOfNode(node: GameNode): ts.TypeNode | undefined {
  assert(isTypedNode(node), "Node is not typed");

  const typeKind = getKeywordType(node.type);
  if (!typeKind) {
    return undefined;
  }
  const baseType = ts.factory.createKeywordTypeNode(typeKind);
  return node.array ? ts.factory.createArrayTypeNode(baseType) : baseType;
}

/** Generate the AST for a function from nodes */
export function makeFunction(
  functionNode: FunctionDeclarationGameNode,
  nodes: Record<string, GameNode>
) {
  const functionName = ts.factory.createIdentifier(functionNode.name);

  const nodesInFunction = getNodesInFunction(nodes, functionNode);
  const params = getParamsForFunction(nodesInFunction);

  const parameters = Object.values(params).map((param) => {
    const name = ts.factory.createIdentifier(param.name);
    const type = getTypeOfNode(param) || undefined;

    return ts.factory.createParameterDeclaration(
      undefined,
      undefined,
      name,
      undefined,
      type,
      undefined
    );
  });

  const returnNode = Object.values(nodesInFunction).find(
    (node) => node.kind === "ReturnStatement"
  );
  assertNodeIsKind<ReturnStatementGameNode>(returnNode, ["ReturnStatement"]);
  const statements = parse(nodesInFunction, nodes, returnNode);

  const returnType = getTypeOfNode(returnNode);

  return ts.factory.createFunctionDeclaration(
    undefined,
    undefined,
    functionName,
    undefined,
    parameters,
    returnType,
    ts.factory.createBlock(statements, true)
  );
}
