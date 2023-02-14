import { BBAnchor, Center, Text3D } from "@react-three/drei";
import { GroupProps } from "@react-three/fiber";
import { ts } from "ts-morph";

import { useGetNode } from "$game/game.store";
import {
  GameNode,
  IdentifierGameNode,
  isCalculatedNode,
  isFunctionNode,
} from "$nodes/nodes";
import monogram from "~/assets/monogram.json";

export interface RenderNodeProps
  extends Omit<GroupProps, "position" | "rotation"> {
  node: GameNode;
  x: number;
  y: number;
  color?: string;
}

export function RenderNode(props: RenderNodeProps) {
  const { x, y, color, node } = props;
  switch (node.kind) {
    case "FunctionDeclaration": {
      return (
        <group {...props} position={[x, 0, y]}>
          <mesh>
            <boxGeometry args={[node.width, 0.1, node.height]} />
            <meshStandardMaterial
              color={color === "#000fff" ? "gray" : color}
            />
          </mesh>

          <BBAnchor anchor={[-1, 0, -1]}>
            <Center top right position={[0, 0.5, 0]}>
              <Text3D font={monogram as any} height={0.5} size={1}>
                <meshStandardMaterial color={color} />
                {node.name || ""}
              </Text3D>
            </Center>
          </BBAnchor>
        </group>
      );
    }
    case "CallExpression": {
      return <TextNode value="()" {...props} />;
    }
    case "Identifier": {
      return <RenderIdentifier {...props} node={node} />;
    }
    case "ElementAccessExpression": {
      return <TextNode value="[]" {...props} />;
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
      return <TextNode value={node.value.toString()} {...props} />;
    }
    case "StringLiteral": {
      return <TextNode value={`"${node.value[0] || ""}"`} {...props} />;
    }
    default: {
      throw new Error("Unknown node kind");
    }
  }
}

interface TextNodeProps extends CubeProps {
  value: string | number;
  node: GameNode;
}

function TextNode({ value, x, y, color, node, ...props }: TextNodeProps) {
  return (
    <group position={[x, 0, y]} {...props}>
      <Center top position={[0, 0.5, 0]}>
        <Text3D font={monogram as any} height={0.5} size={1}>
          <meshStandardMaterial color={color} />
          {value || ""}
        </Text3D>
      </Center>
      <Center top>
        <mesh>
          <boxGeometry args={[1, 0.5, 1]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </Center>

      <RenderInputs node={node} color={color} />
    </group>
  );
}

interface CubeProps extends Omit<GroupProps, "position" | "rotation"> {
  x: number;
  y: number;
  color?: string;
}

interface RenderIdentifierProps extends RenderNodeProps {
  node: IdentifierGameNode;
}

function RenderIdentifier(props: RenderIdentifierProps) {
  const { node, color } = props;
  const [functionNodeId] = node.inputs;

  const functionNode = useGetNode(functionNodeId);

  if (!functionNode) return <TextNode value="?" {...props} />;

  if (!isFunctionNode(functionNode)) {
    throw new Error("Expected function node to be a function declaration.");
  }

  return (
    <>
      <TextNode value={functionNode.name} {...props} />
      <RenderInputs node={node} color={color} />
    </>
  );
}

interface RenderInputProps {
  index: number;
  color?: string;
}

interface RenderInputsProps {
  node: GameNode;
  color?: string;
}

function RenderInputs({ node, color }: RenderInputsProps) {
  if (!isCalculatedNode(node)) return null;

  return (
    <>
      {new Array(node.inputs.length - 1).fill(0).map((_, index) => (
        <RenderInput key={index} index={index + 1} color={color} />
      ))}
    </>
  );
}

function RenderInput({ index, color }: RenderInputProps) {
  return (
    <group position={[0, index, 0]}>
      {/* Pole */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.1, 1, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Connector */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

// a2 = 1 / 2;
