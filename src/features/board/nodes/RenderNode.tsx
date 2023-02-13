import { Center, Text3D } from "@react-three/drei";
import { GroupProps } from "@react-three/fiber";
import { ts } from "ts-morph";

import { useGetNode } from "$game/game.store";
import { GameNode, IdentifierGameNode, isFunctionNode } from "$nodes/nodes";
import monogram from "~/assets/monogram.json";

export interface RenderNodeProps
  extends Omit<GroupProps, "position" | "rotation"> {
  node: GameNode;
  x: number;
  y: number;
  color?: string;
}

export function RenderNode({ node, ...props }: RenderNodeProps) {
  const { x, y } = props;
  switch (node.kind) {
    case "FunctionDeclaration": {
      return (
        <mesh position={[x, 0, y]}>
          <boxGeometry args={[node.width, 0.1, node.height]} />
          <meshStandardMaterial color="gray" />
        </mesh>
      );
    }
    case "CallExpression": {
      return <TextNode value="()" {...props} />;
    }
    case "Identifier": {
      return <RenderIdentifier node={node} {...props} />;
    }
    case "PropertyAccessExpression": {
      return <TextNode value={`(${node.name})`} {...props} />;
    }
    case "Parameter": {
      return <TextNode value={`(${node.name[0]})`} {...props} />;
    }
    case "ReturnStatement": {
      return <TextNode value="|>" {...props} />;
    }
    case "BinaryExpression": {
      return (
        <TextNode value={ts.tokenToString(node.operator) || "?"} {...props} />
      );
    }
    case "VariableStatement": {
      return <TextNode value={node.name} {...props} />;
    }
    case "ConditionalExpression": {
      return <TextNode value="IF" {...props} />;
    }
    case "NumericLiteral": {
      return <TextNode value={node.value} {...props} />;
    }
    case "StringLiteral": {
      return <TextNode value={`"${node.value[0]}"`} {...props} />;
    }
    default: {
      return <Cube {...props} />;
    }
  }
}

interface TextNodeProps extends CubeProps {
  value: string | number;
}

function TextNode({ value, x, y, color, ...props }: TextNodeProps) {
  return (
    <group position={[x, 0, y]} {...props}>
      <Center top position={[0, 0.5, 0]}>
        <Text3D font={monogram as any} height={0.5} size={1}>
          <meshStandardMaterial color={color} />
          {value}
        </Text3D>
      </Center>

      <Center top>
        <mesh>
          <boxGeometry args={[1, 0.5, 1]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </Center>
    </group>
  );
}

interface CubeProps extends Omit<GroupProps, "position" | "rotation"> {
  x: number;
  y: number;
  color?: string;
}

function Cube({ color = "#000fff", x = 0, y = 0, ...props }: CubeProps) {
  return (
    <group {...props} position={[x, 0.5, y]}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

interface RenderIdentifierProps extends RenderNodeProps {
  node: IdentifierGameNode;
}

function RenderIdentifier({ node, ...props }: RenderIdentifierProps) {
  const [functionNodeId] = node.inputs;

  const functionNode = useGetNode(functionNodeId);

  if (!functionNode) return <TextNode value="?" {...props} />;

  if (!isFunctionNode(functionNode)) {
    throw new Error("Expected function node to be a function declaration.");
  }

  return <TextNode value={functionNode.name} {...props} />;
}
