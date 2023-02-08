"use client";

import { HTMLAttributes, ReactNode } from "react";
import {
  FunctionDeclaration,
  Node,
  ts,
  CallExpression,
  ExpressionStatement,
  Identifier,
  StringLiteral,
  ParameterDeclaration,
  ReturnStatement,
  ConditionalExpression,
  BinaryExpression,
} from "ts-morph";
import { MeshProps, Vector2 } from "@react-three/fiber";
import clxs from "clsx";

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
    return <RenderLiteralNode node={node} />;
  } else if (node.isKind(ts.SyntaxKind.Identifier)) {
    return <RenderLiteralNode node={node} />;
  } else if (node.isKind(ts.SyntaxKind.ReturnStatement)) {
    return <RenderReturnStatement node={node} />;
  } else if (node.isKind(ts.SyntaxKind.ConditionalExpression)) {
    return <RenderConditionalExpression node={node} />;
  } else if (node.isKind(ts.SyntaxKind.BinaryExpression)) {
    return <RenderBinaryExpression node={node} />;
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
    <Flex className="fr-body" flexDirection="row">
      <Flex flexDirection="row">
        <Flex flexDirection="column">
          {params.map((param, i) => {
            return (
              <Flex key={i} flexDirection="row" alignItems="center">
                <RenderParameter node={param} />

                <Box className="fr-pipe h-2 w-2 bg-blue-500" flexGrow={1} />
              </Flex>
            );
          })}
        </Flex>

        <Box className="fr-pipe w-2 bg-blue-500" />
      </Flex>

      {node
        .getBody()
        ?.forEachChildAsArray()
        .map((node, i) => {
          return <RenderNode key={i} node={node} />;
        })}
    </Flex>
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

function RenderBinaryExpression({ node }: RenderProps<BinaryExpression>) {
  const left = node.getLeft();
  const right = node.getRight();
  const operator = node.getOperatorToken();

  return (
    <Flex flexDirection="row" alignItems="center">
      <Flex flexDirection="column" alignItems="center">
        <RenderNode node={left} />
        <RenderNode node={right} />
      </Flex>

      <RenderLiteralNode node={operator} />
    </Flex>
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
      <Flex flexDirection="row" alignItems="stretch">
        <Flex flexDirection="column" alignItems="flex-end">
          <Flex flexDirection="row" alignItems="center">
            <RenderNode node={condition} />
            <div className="fr-pipe flex-grow h-2 w-2 bg-blue-500" />
          </Flex>

          <Flex flexDirection="row" alignItems="center">
            <RenderNode node={whenTrue} />
            <div className="fr-pipe flex-grow h-2 w-2 bg-blue-500" />
          </Flex>

          <Flex flexDirection="row" alignItems="center">
            <RenderNode node={whenFalse} />
            <div className="fr-pipe flex-grow h-2 w-2 bg-blue-500" />
          </Flex>
        </Flex>
        <div className="fr-art-pipe-up h-full w-2 bg-blue-500"></div>
      </Flex>

      <Flex flexDirection="column" justifyContent="center">
        <Flex flexDirection="row" alignItems="center">
          <div className="fr-art-pipe-up h-2 w-2 bg-blue-500"></div>
          <Cube color="#000fff">
            <Text>IF</Text>
          </Cube>
        </Flex>
      </Flex>
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

function RenderLiteralNode({ node }: RenderProps<Node>) {
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
          <Cube key={i} size={0.25} color="#0000ff" y={0.25 + i * 0.25 * 1.2} />
        );
      })}

      <>
        {type?.isKind(ts.SyntaxKind.NumberKeyword) && (
          <RenderNumberType size={0.25} x={0.25} />
        )}
        {type?.isKind(ts.SyntaxKind.StringKeyword) && (
          <Cube size={0.25} x={0.25} y={0.25} color="#000fff" />
        )}
      </>

      <Cube color="#000fff" size={0.75} x={0.25} y={0.25}>
        <Text color="white" fontSize={0.25} position={[0, 0.51]}>
          {node.getName() || "FN"}
        </Text>
      </Cube>
    </>
  );
}

function RenderNumberType({
  size = 1,
  y = 0,
  ...props
}: Omit<CubeProps, "color">) {
  const cubeSize = size / Math.sqrt(2);

  return (
    <Cube
      {...props}
      size={cubeSize}
      rotation={QUARTER_TURN}
      y={y + (size - cubeSize) / 2}
      color="#000fff"
    />
  );
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

interface BoxProps extends HTMLAttributes<HTMLDivElement> {
  display?: "flex" | "block";
  alignItems?: "center" | "flex-start" | "flex-end" | "stretch";
  justifyContent?: "center" | "flex-start" | "flex-end" | "space-between";
  flexDirection?: "row" | "column";
  flex?: number;
  flexGrow?: number;
  flexShrink?: number;
}

function Box({
  className,
  display,
  alignItems,
  justifyContent,
  flexDirection,
  flex,
  flexGrow,
  flexShrink,
  ...props
}: BoxProps) {
  const alignClass = alignItems
    ? `items-${alignItems.replace("flex-", "")}`
    : undefined;
  const justifyClass = justifyContent ? `justify-${justifyContent}` : undefined;
  const flexDirectionClass = flexDirection
    ? `flex-${flexDirection === "column" ? "col" : "row"}`
    : undefined;
  const flexClass = flex ? `flex-${flex}` : undefined;
  const flexGrowClass = flexGrow ? `flex-grow-${flexGrow}` : undefined;
  const flexShrinkClass = flexShrink ? `flex-shrink-${flexShrink}` : undefined;

  return (
    <div
      className={clxs(
        className,
        display,
        alignClass,
        justifyClass,
        flexDirectionClass,
        flexClass,
        flexGrowClass,
        flexShrinkClass
      )}
      {...props}
    />
  );
}

interface FlexProps extends Omit<BoxProps, "display"> {}

function Flex(props: FlexProps) {
  return <Box display="flex" {...props} />;
}

interface CubeProps extends Omit<MeshProps, "position" | "rotation"> {
  rotation?: number;
  x?: number;
  y?: number;
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

interface GroupProps {
  children: ReactNode;
  x?: number;
  y?: number;
}

function Group({ children, x = 0, y = 0 }: GroupProps) {
  return <div className={`absolute top-[${y}] left-[${x}]`}>{children}</div>;
}
