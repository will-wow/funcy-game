import { getNodesInFunction, getParamsForFunction } from "$nodes/functions";
import {
  assertNodeIsKind,
  FunctionDeclarationGameNode,
  GameNode,
  GameNodes,
  ReturnStatementGameNode,
} from "$nodes/nodes";

function formatNodes(
  nodes: GameNodes,
  formattedNodes: GameNodes
  node: GameNode
): GameNodes {



  return formattedNodes;
}

export function formatFunction(
  functionNode: FunctionDeclarationGameNode,
  nodes: GameNodes
): GameNodes {
  const formattedNodes: GameNodes = {};

  const { height, width } = functionNode;

  const nodesInFunction = getNodesInFunction(nodes, functionNode);

  const params = getParamsForFunction(nodesInFunction);

  const returnNode = Object.values(nodesInFunction).find(
    (node) => node.kind === "ReturnStatement"
  );
  assertNodeIsKind<ReturnStatementGameNode>(returnNode, ["ReturnStatement"]);

  formattedNodes[returnNode.id] = {
    ...returnNode,
    x: width / 2,
    y: -height / 2,
  };
}
