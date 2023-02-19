import {
  GameNodes,
  FunctionDeclarationGameNode,
  GameNode,
  ParameterGameNode,
} from "./nodes";

export function getNodesInFunction(
  nodes: GameNodes,
  fn: FunctionDeclarationGameNode
): GameNodes {
  const nodesInFunction: GameNodes = {};

  for (const nodeId in nodes) {
    const node = nodes[nodeId];
    if (isNodeInsideFunction(node, fn)) {
      nodesInFunction[nodeId] = node;
    }
  }

  return nodesInFunction;
}

export function getParamsForFunction(nodesInFunction: GameNodes) {
  const nodeList = Object.values(nodesInFunction);
  const params = nodeList.filter(
    (node) => node.kind === "Parameter"
  ) as ParameterGameNode[];

  return params.sort((a, b) => a.x - b.x);
}

function isNodeInsideFunction(node: GameNode, fn: FunctionDeclarationGameNode) {
  if (node.kind === "FunctionDeclaration") return false;

  const { x, y, width, height } = fn;

  return (
    node.x >= x - width / 2 &&
    node.x <= x + width / 2 &&
    node.y >= y - height / 2 &&
    node.y <= y + height / 2
  );
}
