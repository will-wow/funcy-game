import {
  BaseCalculatedGameNode,
  BaseExpressionGameNode,
  BaseVariableGameNode,
  GameNode,
  isVariableNode,
} from "./nodes";

function immutableTuplePush<T extends any[]>(tuple: T, value: T[number]): T {
  const result = [...tuple];
  result.push(value);

  let isNullFound = false;

  return tuple.map((item) => {
    if (isNullFound) return item;
    if (item === null) {
      isNullFound = true;
      return value;
    }
    return item;
  }) as T;
}

export function setInputOnNode<T extends BaseCalculatedGameNode>(
  node: T,
  inputNode: GameNode
): T {
  return { ...node, inputs: immutableTuplePush(node.inputs, inputNode.id) };
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
