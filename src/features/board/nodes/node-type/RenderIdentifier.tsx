import { useGetNode } from "$game/game.store";
import { IdentifierGameNode, isFunctionNode } from "$nodes/nodes";

import { RenderNodeProps } from "./RenderNodeProps";
import { TextNode } from "./RenderTextNode";

export function RenderIdentifier(props: RenderNodeProps<IdentifierGameNode>) {
  const { node } = props;
  const [functionNodeId] = node.inputs;

  const functionNode = useGetNode(functionNodeId);

  if (!functionNode) return <TextNode value="?" {...props} />;

  if (!isFunctionNode(functionNode)) {
    throw new Error("Expected function node to be a function declaration.");
  }

  return <TextNode value={functionNode.name} {...props} />;
}
