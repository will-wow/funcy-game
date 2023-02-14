import { BBAnchor, Center, Edges, Text3D } from "@react-three/drei";
import { GroupProps } from "@react-three/fiber";
import { ts } from "ts-morph";

import { useGetNode } from "$game/game.store";
import {
  GameNode,
  IdentifierGameNode,
  isCalculatedNode,
  isFunctionNode,
} from "$nodes/nodes";
import { solarized } from "$utils/dracula";
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
      const fnColor = color === "#000fff" ? solarized.yellow : solarized.base0;
      return (
        <group {...props} position={[x, 0, y]}>
          <mesh position={[0, 0, node.height / 2 - 0.05]}>
            <boxGeometry args={[node.width, 0.2, 0.1]} />
            <meshStandardMaterial color={fnColor} />
          </mesh>

          <mesh position={[0, 0, -(node.height / 2 - 0.05)]}>
            <boxGeometry args={[node.width, 0.2, 0.1]} />
            <meshStandardMaterial color={fnColor} />
          </mesh>

          <mesh position={[node.width / 2, 0, 0]}>
            <boxGeometry args={[0.1, 0.2, node.height]} />
            <meshStandardMaterial color={fnColor} />
          </mesh>

          <mesh position={[-node.width / 2, 0, 0]}>
            <boxGeometry args={[0.1, 0.2, node.height]} />
            <meshStandardMaterial color={fnColor} />
          </mesh>

          <BBAnchor anchor={[-1, 0, -1]}>
            <Center top right position={[0, 0.2, -0.25]}>
              <Text3D font={monogram as any} height={0.5} size={1} castShadow>
                <meshStandardMaterial color={solarized.blue} />
                {node.name || ""}
              </Text3D>
            </Center>
          </BBAnchor>
        </group>
      );
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

interface TextNodeProps extends CubeProps {
  value: string | number;
  node: GameNode;
}

function TextNode({ value, x, y, color, node, ...props }: TextNodeProps) {
  return (
    <group position={[x, 0, y]} {...props}>
      <Center top position={[0, 0.5, 0]}>
        <Text3D font={monogram as any} height={0.5} size={1} castShadow>
          <meshStandardMaterial color={color} />
          {value || ""}
        </Text3D>
      </Center>
      <Center top>
        <mesh castShadow>
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
