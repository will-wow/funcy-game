import { useMemo } from "react";

import { useGetNode, useNodes } from "$game/game.store";
import { getNodesInFunction, getParamsForFunction } from "$nodes/functions";
import {
  CallExpressionGameNode,
  FunctionDeclarationGameNode,
  isFunctionNode,
  NewExpressionGameNode,
} from "$nodes/nodes";
import { noop } from "$utils/utils";

import { RenderArbitraryInputs } from "./RenderInputs";
import { OnNodeCallback, RenderNodeProps } from "./RenderNodeProps";
import { TextNode } from "./RenderTextNode";

export function RenderCallExpression({
  x,
  y,
  ...props
}: RenderNodeProps<CallExpressionGameNode | NewExpressionGameNode>) {
  const { node, color, onHover = noop, onClick = noop } = props;
  const [identifierNodeId] = node.inputs;

  const identifierNode = useGetNode(identifierNodeId);
  const functionNode = useGetNode(
    identifierNode?.kind === "Identifier" ? identifierNode.inputs[0] : null
  );

  const display = node.kind === "CallExpression" ? "()" : "new";

  return (
    <group position={[x, 0, y]}>
      <TextNode x={0} y={0} value={display} {...props} />;
      {functionNode && isFunctionNode(functionNode) && (
        <RenderFunctionInputs
          functionNode={functionNode}
          color={color}
          onHover={onHover}
          onClick={onClick}
        />
      )}
    </group>
  );
}

interface RenderFunctionInputsProps {
  functionNode: FunctionDeclarationGameNode;
  color?: string;
  onHover: OnNodeCallback;
  onClick: OnNodeCallback;
}

function RenderFunctionInputs({
  functionNode,
  color,
  onHover,
  onClick,
}: RenderFunctionInputsProps) {
  const nodes = useNodes();

  const paramNodes = useMemo(() => {
    const nodesInFunction = getNodesInFunction(nodes, functionNode);
    return getParamsForFunction(nodesInFunction);
  }, [functionNode, nodes]);

  return (
    <RenderArbitraryInputs
      inputCount={paramNodes.length}
      color={color}
      onHover={onHover}
      onClick={onClick}
    />
  );
}
