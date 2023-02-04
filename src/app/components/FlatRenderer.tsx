"use client";

import { ReactNode } from "react";
import {
  FunctionDeclaration,
  Node,
  ts,
  CallExpression,
  ExpressionStatement,
  Identifier,
  StringLiteral,
  NumericLiteral,
  ParameterDeclaration,
  ReturnStatement,
  ConditionalExpression,
} from "ts-morph";
import { MeshProps, Vector2 } from "@react-three/fiber";
import { Vector2 as ThreeVector2 } from "three";

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
  } else if (node.isKind(ts.SyntaxKind.StringLiteral)) {
    return <RenderStringLiteral node={node} />;
  } else if (node.isKind(ts.SyntaxKind.NumericLiteral)) {
    return <RenderNumericLiteral node={node} />;
  } else if (node.isKind(ts.SyntaxKind.Identifier)) {
    return <RenderIdentifier node={node} />;
  } else if (node.isKind(ts.SyntaxKind.ReturnStatement)) {
    return <RenderReturnStatement node={node} />;
  } else if (node.isKind(ts.SyntaxKind.ConditionalExpression)) {
    return <RenderConditionalExpression node={node} />;
  } else {
    // eslint-disable-next-line no-console
    console.info("unknown node", node);
    return null;
  }
}

interface RenderProps<N extends Node> {
  node: N;
}

export function RenderBody({ node }: RenderProps<FunctionDeclaration>) {
  const params = node.getParameters();
  return (
    <div className="fr-body flex flex-row">
      <div className="fr-params flex flex-row">
        <div className="flex flex-col">
          {params.map((param, i) => {
            return (
              <div key={i} className="flex flex-row items-center">
                <RenderParameter node={param} />
                <div className="fr-pipe flex-grow h-2 w-2 bg-blue-500" />
              </div>
            );
          })}
        </div>

        <div className="fr-pipe h-full w-2 bg-blue-500" />
      </div>

      {node
        .getBody()
        ?.forEachChildAsArray()
        .map((node, i) => {
          return <RenderNode key={i} node={node} />;
        })}
    </div>
  );
}

function RenderReturnStatement({ node }: RenderProps<ReturnStatement>) {
  return (
    <>
      {node.forEachChildAsArray().map((node, i) => {
        return <RenderNode key={i} node={node} />;
      })}
    </>
  );
}

function RenderConditionalExpression({
  node,
}: RenderProps<ConditionalExpression>) {
  const condition = node.getCondition();
  const whenTrue = node.getWhenTrue();
  const whenFalse = node.getWhenFalse();

  return (
    <div className={`call if flex border-2 border-solid border-blue-300`}>
      <div className="fr-args flex flex-row items-stretch">
        <div className="flex fr-arg-list flex-col items-end">
          <div className="flex flex-row items-center">
            <RenderNode node={condition} />
            <div className="fr-pipe flex-grow h-2 w-2 bg-blue-500" />
          </div>

          <div className="flex flex-row items-center">
            <RenderNode node={whenTrue} />
            <div className="fr-pipe flex-grow h-2 w-2 bg-blue-500" />
          </div>

          <div className="flex flex-row items-center">
            <RenderNode node={whenFalse} />
            <div className="fr-pipe flex-grow h-2 w-2 bg-blue-500" />
          </div>
        </div>
        <div className="fr-art-pipe-up h-full w-2 bg-blue-500"></div>
      </div>

      <div className="fr-call-func flex flex-col justify-center">
        <div className="flex flex-row items-center">
          <div className="fr-art-pipe-up h-2 w-2 bg-blue-500"></div>
          <Cube color="#000fff">
            <Text>IF</Text>
          </Cube>
        </div>
      </div>
    </div>
  );
}

function RenderParameter({ node }: { node: ParameterDeclaration }) {
  return (
    <Cube>
      <Text>{node.getName()}</Text>
    </Cube>
  );
}

function RenderIdentifier({ node }: { node: Identifier }) {
  return (
    <Cube>
      <Text>{node.getText()}</Text>
    </Cube>
  );
}

function RenderNumericLiteral({ node }: { node: NumericLiteral }) {
  return (
    <Cube>
      <Text>{node.getText()}</Text>
    </Cube>
  );
}

function RenderStringLiteral({ node }: { node: StringLiteral }) {
  const value = node.getLiteralValue();
  return (
    <Cube color={isColor(value) ? value : "blue"}>
      <Text>{value}</Text>
    </Cube>
  );
}

function RenderCallExpression({ node }: { node: CallExpression }) {
  const identifier = node.forEachChildAsArray()[0] as Identifier;
  const name = identifier.getText();
  const args = node.getArguments();

  return (
    <div className={`call ${name} flex border-2 border-solid border-blue-300`}>
      <div className="fr-args flex flex-row items-stretch">
        <div className="flex fr-arg-list flex-col items-end">
          {args.map((arg, i) => {
            return (
              <div key={i} className="flex flex-row items-center">
                <RenderNode key={i} node={arg} />
                <div className="fr-pipe flex-grow h-2 w-2 bg-blue-500" />
              </div>
            );
          })}
        </div>
        <div className="fr-art-pipe-up h-full w-2 bg-blue-500"></div>
      </div>

      <div className="fr-call-func flex flex-col justify-center">
        <div className="flex flex-row items-center">
          <div className="fr-art-pipe-up h-2 w-2 bg-blue-500"></div>
          <Cube color="#000fff">
            <Text>{name}</Text>
          </Cube>
        </div>
      </div>
    </div>
  );
}

// function RenderCallExpressionDefinition({ node }: { node: CallExpression }) {
//   const identifier = node.forEachChildAsArray()[0] as Identifier;

//   const [definition] = identifier.getDefinitionNodes();

//   return <RenderNode node={definition} />;
// }

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
    <>
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
        <Text color="white" fontSize={0.25} position={[0, 0.51]}>
          {node.getName() || "FN"}
        </Text>
      </Cube>
    </>
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
  color?: string;
  size?: number;
}

export function Cube({
  color = "#000fff",
  size = 1,
  // position = 0,
  rotation,
  children,
}: CubeProps) {
  return (
    <div
      className="fr-cube"
      style={{
        width: `${size * 100}px`,
        height: `${size * 100}px`,
        backgroundColor: color,
        transform: `rotate(${rotation}rad)`,
      }}
    >
      {children}
    </div>
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

interface TextProps {
  color?: string;
  fontSize?: number;
  position?: Vector2;
  children: ReactNode;
}

function Text({ color = "white", fontSize = 1, children }: TextProps) {
  // const { x, y } = normalizePosition2(position);
  return (
    <span
      className="fr-text"
      style={{
        color,
        fontSize: `${fontSize}em`,
      }}
    >
      {children}
    </span>
  );
}

function isColor(color: string) {
  if (color === "red") return true;
  if (color === "blue") return true;
  return false;
}
