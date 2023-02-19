import { getNodesInFunction } from "./functions";
import { removeOutput, removeInput, removeInputAtIndex } from "./input-output";
import {
  GameNode,
  GameNodes,
  isCalculatedNode,
  isExpressionNode,
  isFunctionNode,
  isVariableNode,
  NodeId,
} from "./nodes";

/** Get a node by ID, and throw if it doesn't exist. */
export function getNode(nodes: GameNodes, nodeId: NodeId): GameNode {
  const node = nodes[nodeId];
  if (!node) {
    throw new Error(`node ${nodeId} not found`);
  }
  return node;
}

export function removeNodeFromNodes(
  nodes: GameNodes,
  nodeId: NodeId
): GameNodes {
  // Remove the node from the list.
  const { [nodeId]: node } = nodes;
  let { [nodeId]: _deletedNode, ...updatedNodes } = nodes;

  if (!node) return nodes;

  if (isCalculatedNode(node)) {
    node.inputs.forEach((inputId) => {
      if (inputId) {
        const inputNode = getNode(nodes, inputId);
        updatedNodes[inputId] = removeOutput(inputNode, node.id);
      }
    });
  }

  if (isVariableNode(node)) {
    node.outputs.forEach((outputId) => {
      const outputNode = getNode(nodes, outputId);
      updatedNodes[outputId] = removeInput(outputNode, node.id);
    });
  }

  if (isExpressionNode(node)) {
    if (node.output) {
      const outputNode = updatedNodes[node.output];
      updatedNodes[node.output] = removeInput(outputNode, node.id);
    }
  }

  if (isFunctionNode(node)) {
    const nodesInFunction = getNodesInFunction(nodes, node);

    for (nodeId in nodesInFunction) {
      updatedNodes = removeNodeFromNodes(updatedNodes, nodeId);
    }
  }

  return updatedNodes;
}

export function removeConnectionFromNodes(
  nodes: GameNodes,
  receivingNode: GameNode,
  inputIndex: number
): GameNodes {
  if (!isCalculatedNode(receivingNode)) return nodes;

  const inputId = receivingNode.inputs[inputIndex];
  if (!inputId) return nodes;

  // Remove the input.
  const inputs = [...receivingNode.inputs];
  inputs[inputIndex] = null;

  return {
    ...nodes,
    [receivingNode.id]: removeInputAtIndex(receivingNode, inputIndex),
    [inputId]: removeOutput(getNode(nodes, inputId), receivingNode.id, 1),
  };
}
