import { ts } from "ts-morph";

import { useGetNode } from "$game/game.store";
import { IdentifierGameNode, isFunctionNode } from "$nodes/nodes";
import { solarized } from "$utils/dracula";
import { noop } from "$utils/utils";

import { RenderFunctionDeclaration } from "./node-type/RenderFunctionDeclaration";
import { RenderInputs } from "./node-type/RenderInputs";
import { RenderNodeProps } from "./node-type/RenderNodeProps";
import { TextNode } from "./node-type/RenderTextNode";

export function RenderNode(props: RenderNodeProps) {
  const { node } = props;
  switch (node.kind) {
    case "FunctionDeclaration": {
      return <RenderFunctionDeclaration {...props} node={node} />;
    }
    case "CallExpression": {
      return <TextNode value="()" {...props} color={solarized.violet} />;
    }
    case "Identifier": {
      return <RenderIdentifier {...props} node={node} color={solarized.blue} />;
    }
    case "ElementAccessExpression": {
      return <TextNode value="[]" {...props} color={solarized.blue} />;
    }
    case "Parameter": {
      return (
        <TextNode
          value={`(${node.name[0]})`}
          {...props}
          color={solarized.base0}
        />
      );
    }
    case "ReturnStatement": {
      return <TextNode value="|>" {...props} color={solarized.green} />;
    }
    case "BinaryExpression": {
      return (
        <TextNode
          value={ts.tokenToString(node.operator) || "?"}
          {...props}
          color={solarized.base1}
        />
      );
    }
    case "VariableStatement": {
      return <TextNode value={node.name} {...props} color={solarized.cyan} />;
    }
    case "ConditionalExpression": {
      return <TextNode value="IF" {...props} color={solarized.green} />;
    }
    case "NumericLiteral": {
      return (
        <TextNode
          value={node.value.toString()}
          {...props}
          color={solarized.magenta}
        />
      );
    }
    case "StringLiteral": {
      return (
        <TextNode
          value={`"${node.value[0] || ""}"`}
          {...props}
          color={solarized.yellow}
        />
      );
    }
    default: {
      throw new Error("Unknown node kind");
    }
  }
}

function RenderIdentifier(props: RenderNodeProps<IdentifierGameNode>) {
  const { node, color, onHover = noop, onClick = noop } = props;
  const [functionNodeId] = node.inputs;

  const functionNode = useGetNode(functionNodeId);

  if (!functionNode) return <TextNode value="?" {...props} />;

  if (!isFunctionNode(functionNode)) {
    throw new Error("Expected function node to be a function declaration.");
  }

  return (
    <>
      <TextNode value={functionNode.name} {...props} />
      <RenderInputs
        node={node}
        color={color}
        onHover={onHover}
        onClick={onClick}
      />
    </>
  );
}
