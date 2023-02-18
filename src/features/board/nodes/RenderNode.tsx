import { BBAnchor, Center, Text3D } from "@react-three/drei";
import { GroupProps, ThreeEvent } from "@react-three/fiber";
import { ts } from "ts-morph";

import { useGetNode } from "$game/game.store";
import {
  FunctionDeclarationGameNode,
  GameNode,
  IdentifierGameNode,
  isCalculatedNode,
  isFunctionNode,
} from "$nodes/nodes";
import { solarized } from "$utils/dracula";
import monogram from "~/assets/monogram.json";

type OnNodeCallback = (e: ThreeEvent<MouseEvent>, inputIndex: number) => void;

export interface RenderNodeProps
  extends Omit<GroupProps, "position" | "rotation" | "onClick"> {
  node: GameNode;
  x: number;
  y: number;
  color?: string;
  onClick?: OnNodeCallback;
  onHover?: OnNodeCallback;
}

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

interface TextNodeProps extends Omit<CubeProps, "onClick"> {
  value: string | number;
  node: GameNode;
  onHover?: OnNodeCallback;
  onClick?: OnNodeCallback;
}

function TextNode({
  value,
  x,
  y,
  color,
  node,
  onHover = noop,
  onClick = noop,
  ...props
}: TextNodeProps) {
  return (
    <group position={[x, 0, y]} {...props}>
      <mesh
        onPointerMove={stopPropagation}
        onPointerEnter={(e) => {
          onHover?.(e, 0);
        }}
        onClick={(e) => {
          onClick?.(e, 0);
        }}
      >
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
      </mesh>

      <RenderInputs
        node={node}
        color={color}
        onHover={onHover}
        onClick={onClick}
      />
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

interface RenderInputsProps {
  node: GameNode;
  color?: string;
  onHover: OnNodeCallback;
  onClick: OnNodeCallback;
}

function RenderInputs({ node, color, onHover, onClick }: RenderInputsProps) {
  if (!isCalculatedNode(node)) return null;

  return (
    <>
      {new Array(node.inputs.length - 1).fill(0).map((_, index) => (
        <RenderInput
          key={index}
          index={index + 1}
          color={color}
          onHover={onHover}
          onClick={onClick}
        />
      ))}
    </>
  );
}

interface RenderInputProps {
  index: number;
  color?: string;
  onHover: OnNodeCallback;
  onClick: OnNodeCallback;
}

function RenderInput({ index, color, onHover, onClick }: RenderInputProps) {
  return (
    <group position={[0, index, 0]}>
      {/* Pole */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.1, 1, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Connector */}
      <mesh
        position={[0, 1, 0]}
        onPointerMove={stopPropagation}
        onPointerEnter={(e) => {
          onHover(e, index + 1);
        }}
        onClick={(e) => {
          onClick(e, index);
        }}
      >
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

interface RenderFunctionDeclarationProps extends Omit<RenderNodeProps, "node"> {
  node: FunctionDeclarationGameNode;
}

function RenderFunctionDeclaration({
  node,
  x,
  y,
  color,
  onClick: _,
  ...rest
}: RenderFunctionDeclarationProps) {
  const fnColor = color === "#000fff" ? solarized.yellow : solarized.base0;
  return (
    <group {...rest} position={[x, 0, y]}>
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

function stopPropagation(e: ThreeEvent<any>) {
  e.stopPropagation();
}

function noop() {}
