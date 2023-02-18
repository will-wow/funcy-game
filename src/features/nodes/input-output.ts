import {
  BaseCalculatedGameNode,
  BaseExpressionGameNode,
  BaseVariableGameNode,
  GameNode,
  isCallNode,
  isVariableNode,
  isCalculatedNode,
  isExpressionNode,
  NodeId,
} from "./nodes";

function immutableTupleSet<T extends any[]>(
  tuple: T,
  index: number,
  value: T[number]
): T {
  const result = [...tuple];
  result[index] = value;

  return result as T;
}

export function setInputOnNode<T extends BaseCalculatedGameNode>(
  node: T,
  inputNode: GameNode,
  inputIndex: number
): T {
  const inputs = isCallNode(node)
    ? [...node.inputs, inputNode.id]
    : immutableTupleSet(node.inputs, inputIndex, inputNode.id);
  return { ...node, inputs };
}

export function setOutputOnNode<
  T extends BaseExpressionGameNode | BaseVariableGameNode
>(node: T, outputNode: GameNode): T {
  if (isVariableNode(node)) {
    return {
      ...node,
      outputs: [...node.outputs, outputNode.id],
    };
  } else {
    return { ...node, output: outputNode.id };
  }
}

export function removeInput<T extends GameNode>(node: T, inputId: NodeId): T {
  if (!isCalculatedNode(node)) {
    return node;
  }

  return {
    ...node,
    inputs: node.inputs.map((id) => (id === inputId ? null : id)),
  };
}

export function removeInputAtIndex<T extends GameNode>(
  node: T,
  index: number
): T {
  if (!isCalculatedNode(node)) {
    return node;
  }

  const inputs = [...node.inputs];
  inputs[index] = null;

  return {
    ...node,
    inputs,
  };
}

export function removeOutput<T extends GameNode>(
  node: T,
  outputId: NodeId,
  /**
   * Optionally restrict the number of times to remove the output.
   * This is useful for removing an output from a variable that outputs to the same node twice.
   */
  maxRemovals?: number
): T {
  if (isExpressionNode(node)) {
    if (node.output !== outputId) {
      return node;
    }
    return {
      ...node,
      output: null,
    };
  }

  if (isVariableNode(node)) {
    let removals = 0;
    return {
      ...node,
      outputs: node.outputs.filter((id) => {
        if (maxRemovals && removals >= maxRemovals) return true;

        if (id === outputId) {
          removals++;
          return false;
        }

        return true;
      }),
    };
  }

  return node;
}
