"use client";

import {
  FunctionDeclaration,
  Node,
  ts,
  CallExpression,
  ExpressionStatement,
  Identifier,
} from "ts-morph";
import { Text } from "@react-three/drei";
// import { SourceContext } from "./SourceContext";
import { MeshProps, Vector2 } from "@react-three/fiber";
import { Vector3 as ThreeVector3, Vector2 as ThreeVector2, Euler } from "three";

const NINETY_DEGREES = Math.PI / 2;
const QUARTER_TURN = Math.PI / 4;

interface RenderNodeProps {
  node: Node;
}

export function RenderNode({ node }: RenderNodeProps) {
  if (node.isKind(ts.SyntaxKind.FunctionDeclaration)) {
    return <RenderFunction node={node} />;
  } else if (node.isKind(ts.SyntaxKind.ExpressionStatement)) {
    return <RenderExpressionStatement node={node} />;
  } else if (node.isKind(ts.SyntaxKind.CallExpression)) {
    return <RenderCallExpression node={node} />;
  } else {
    return null;
  }
}

interface RenderProps<N extends Node> {
  node: N;
}

export function RenderBody({ node }: RenderProps<Node>) {
  return (
    <>
      {node.forEachChildAsArray().map((node, i) => {
        return <RenderNode key={i} node={node} />;
      })}
    </>
  );
}

function RenderCallExpression({ node }: { node: CallExpression }) {
  const identifier = node.forEachChildAsArray()[0] as Identifier;
	const args = node.getArguments()

  return <RenderNode node={definition} />;
}

function RenderCallExpressionDefinition({ node }: { node: CallExpression }) {
  const identifier = node.forEachChildAsArray()[0] as Identifier;

  const [definition] = identifier.getDefinitionNodes();

  return <RenderNode node={definition} />;
}

function RenderExpressionStatement({ node }: RenderProps<ExpressionStatement>) {
  return (
    <>
      {node.forEachChildAsArray().map((node, i) => {
        return <RenderNode key={i} node={node} />;
      })}
    </>
  );
}

export function RenderFunction({ node }: RenderProps<FunctionDeclaration>) {
  // const source = useContext(SourceContext);

  const type = node.getReturnTypeNode();

  return (
    <group>
      {node.getParameters().map((node, i) => {
        return (
          <Cube
            key={i}
            size={0.25}
            color="#0000ff"
            position={[0, 0.25 + i * 0.25 * 1.2]}
          />
        );
      })}

      <>
        {type?.isKind(ts.SyntaxKind.NumberKeyword) && (
          <RenderNumberType size={0.25} position={[0.25, 0]} />
        )}
        {type?.isKind(ts.SyntaxKind.StringKeyword) && (
          <Cube size={0.25} position={[0.25, 0.125]} color="#000fff" />
        )}
      </>

      <Cube color="#000fff" size={0.75} position={[0.25, 0.25]}>
        <Text
          color="white"
          anchorX="center"
          anchorY="middle"
          fontSize={0.25}
          position={[0, 0.51, 0]}
          rotation={[-NINETY_DEGREES, 0, 0]}
        >
          {node.getName() || "FN"}
        </Text>
      </Cube>
    </group>
  );
}

function RenderNumberType({
  size = 1,
  position,
  ...props
}: Omit<CubeProps, "color">) {
  const { x, y } = normalizePosition2(position);

  const cubeSize = size / Math.sqrt(2);

  return (
    <Cube
      {...props}
      size={cubeSize}
      rotation={QUARTER_TURN}
      position={[x, y + (size - cubeSize) / 2]}
      color="#000fff"
    />
  );
}

interface CubeProps extends Omit<MeshProps, "position" | "rotation"> {
  rotation?: number;
  position?: Vector2;
  color: string;
  size?: number;
}

export function Cube({
  color,
  size = 1,
  position = 0,
  rotation,
  children,
}: CubeProps) {
  const offset = size / 2;

  const { x, y } = normalizePosition2(position);
  const normalizedPosition = new ThreeVector3(
    x + offset,
    offset,
    y * -1 - offset
  );

  const normalizedRotation = rotation ? new Euler(0, rotation, 0) : undefined;

  return (
    <mesh position={normalizedPosition} rotation={normalizedRotation}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial color={color} />

      {children}
    </mesh>
  );
}

function normalizePosition2(position: Vector2 | undefined): ThreeVector2 {
  if (!position) return new ThreeVector2(0, 0);
  if (Array.isArray(position)) {
    const [x, y] = position;
    return new ThreeVector2(x, y);
  } else if (typeof position === "number") {
    return new ThreeVector2(position, position);
  } else {
    return position as ThreeVector2;
  }
}
