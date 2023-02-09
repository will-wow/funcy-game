"use client";

import { Fragment, useState } from "react";
import { MOUSE, Vector2 } from "three";
import { Canvas, GroupProps } from "@react-three/fiber";
import { Center, OrbitControls, Text3D } from "@react-three/drei";
import { ts } from "ts-morph";
import clsx from "clsx";

import { setInputOnNode, setOutputOnNode } from "../nodes/input-output";
import { PlayArea } from "./components/PlayArea";
import { Lighting } from "./components/Lighting";
import { getEmptyNode } from "$nodes/empty-node";
import monogram from "~/assets/monogram.json";
import {
  GameNode,
  NodeId,
  isCalculatedNode,
  isExpressionNode,
  isVariableNode,
  NodeKind,
} from "$nodes/nodes";
import { compileNodes } from "$parser/compile";
import { NINETY_DEGREES } from "$three/rotations";

const DEFAULT_FUNCTION: Record<string, GameNode> = {
  p1: getEmptyNode("Parameter", { x: -12, y: 0, id: "p1" }),
  return: getEmptyNode("ReturnStatement", { x: 12, y: 0, id: "return" }),
};

export function GameBoard() {
  const [nodes, setNodes] =
    useState<Record<NodeId, GameNode>>(DEFAULT_FUNCTION);

  const [mode, setMode] = useState<"place" | "connect">("place");

  const [selectedNode, setSelectedNode] = useState<GameNode | null>(null);
  const [nodeToPlace, setNodeToPlace] = useState<GameNode | null>(null);

  const [hoverPoint, setHoverPoint] = useState<Vector2 | null>(null);

  return (
    <div className="h-screen relative">
      <Canvas>
        <PlayArea
          onHover={setHoverPoint}
          onClick={({ x, y }) => {
            if (mode === "place" && nodeToPlace) {
              setNodes((nodes) => {
                const newNode = {
                  ...nodeToPlace,
                  x,
                  y,
                  id: Math.random().toString(),
                };
                return {
                  ...nodes,
                  [newNode.id]: { ...newNode, x, y },
                };
              });
            }
          }}
        >
          <meshStandardMaterial color="#949a49" />
        </PlayArea>

        {mode === "place" && hoverPoint && nodeToPlace && (
          <RenderNode
            node={nodeToPlace}
            color="#ffffff"
            x={hoverPoint.x}
            y={hoverPoint.y}
          />
        )}

        {mode === "connect" && selectedNode && hoverPoint && (
          <Connection
            startX={selectedNode.x}
            startY={selectedNode.y}
            endX={hoverPoint.x}
            endY={hoverPoint.y}
            color="#ffffff"
          />
        )}

        {Object.values(nodes).map((node) => {
          return (
            <Fragment key={node.id}>
              <RenderNode
                node={node}
                color="#000fff"
                x={node.x}
                y={node.y}
                onClick={(event) => {
                  if (mode === "place") {
                    if (node.kind === "ReturnStatement") {
                      return;
                    }
                    setNodes((nodes) => {
                      const { [node.id]: _, ...rest } = nodes;
                      return rest;
                    });
                    event.stopPropagation();
                  } else if (mode === "connect") {
                    if (selectedNode) {
                      if (
                        !(
                          isCalculatedNode(node) &&
                          (isExpressionNode(selectedNode) ||
                            isVariableNode(selectedNode))
                        )
                      ) {
                        return;
                      }
                      const nodeWithInput = setInputOnNode(node, selectedNode);
                      const selectedNodeWithOutput = setOutputOnNode(
                        selectedNode,
                        node
                      );

                      setNodes((nodes) => {
                        return {
                          ...nodes,
                          [node.id]: nodeWithInput,
                          [selectedNode.id]: selectedNodeWithOutput,
                        };
                      });

                      setSelectedNode(null);
                    } else {
                      setSelectedNode(node);
                    }
                  }
                }}
              />

              {isExpressionNode(node) && node.output && (
                <Connection
                  startX={node.x}
                  startY={node.y}
                  endX={nodes[node.output].x}
                  endY={nodes[node.output].y}
                  color="#000fff"
                />
              )}

              {isVariableNode(node) && (
                <>
                  {node.outputs.map((output, i) => (
                    <Connection
                      key={`${output}-${i}`}
                      startX={node.x}
                      startY={node.y}
                      endX={nodes[output].x}
                      endY={nodes[output].y}
                      color="#000fff"
                    />
                  ))}
                </>
              )}
            </Fragment>
          );
        })}

        <Lighting />

        <OrbitControls
          mouseButtons={{
            MIDDLE: MOUSE.DOLLY,
            RIGHT: MOUSE.ROTATE,
          }}
          maxPolarAngle={NINETY_DEGREES - 0.01}
          maxDistance={100}
        />
      </Canvas>

      <div className="absolute top-0 right-0 flex flex-col">
        <button
          className="border border-white"
          onClick={() => setNodes(DEFAULT_FUNCTION)}
        >
          Clear
        </button>
        <br />
        <NodeSelector value={nodeToPlace} onChange={setNodeToPlace} />
      </div>

      <div className="flex justify-between absolute bottom-0 left-10 right-10">
        <button onClick={() => setMode("place")}>Place</button>
        <button onClick={() => setMode("connect")}>Connect</button>
        <button
          onClick={async () => {
            const { generatedCode, diagnostics } = await compileNodes(
              "f",
              nodes
            );

            if (diagnostics.length) {
              console.error(
                generatedCode,
                diagnostics.map((d) => d.getMessageText())
              );
            } else {
              // eslint-disable-next-line no-console
              console.log(generatedCode);
            }
          }}
        >
          Run
        </button>
      </div>
    </div>
  );
}

export interface ConnectionProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
}

export function Connection({
  startX,
  startY,
  endX,
  endY,
  color,
}: ConnectionProps) {
  const minX = Math.min(startX, endX);
  const minY = Math.min(startY, endY);
  const maxX = Math.max(startX, endX);
  const maxY = Math.max(startY, endY);

  const xLength = maxX - minX;
  const yLength = maxY - minY;

  const xDirection = startX < endX ? 1 : -1;
  const yDirection = startY > endY ? 1 : -1;

  const fullLength = Math.sqrt(xLength * xLength + yLength * yLength);

  const centerX = minX + xLength / 2;
  const centerY = minY + yLength / 2;

  // Angle in radians to rotate the line
  const angle = Math.atan2(yLength * yDirection, xLength * xDirection);

  return (
    <mesh position={[centerX, 0.05, centerY]} rotation={[0, angle, 0]}>
      <boxGeometry args={[fullLength, 0.1, 0.25]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

interface NodeSelectorProps {
  className?: string;
  value: GameNode | null;
  onChange: (value: GameNode | null) => void;
}

function NodeSelector({ value, onChange }: NodeSelectorProps) {
  return (
    <>
      <NodeSelectorButton
        selectedValue={value}
        value="NumericLiteral"
        label="Number"
        onChange={onChange}
      />
      <NodeSelectorButton
        selectedValue={value}
        value="StringLiteral"
        label="String"
        onChange={onChange}
      />
      <NodeSelectorButton
        selectedValue={value}
        value="Parameter"
        label="Parameter"
        onChange={onChange}
      />
      <NodeSelectorButton
        selectedValue={value}
        value="Identifier"
        label="Variable"
        onChange={onChange}
      />
      <NodeSelectorButton
        selectedValue={value}
        value="BinaryExpression"
        label="Binary Expression"
        onChange={onChange}
      />
      <NodeSelectorButton
        selectedValue={value}
        value="ConditionalExpression"
        label="IF"
        onChange={onChange}
      />

      {value && <NodeOptions node={value} onChange={onChange} />}
    </>
  );
}

interface NodeSelectorButtonProps {
  selectedValue: GameNode | null;
  value: NodeKind;
  label: string;
  onChange: (value: GameNode | null) => void;
}

function NodeSelectorButton({
  selectedValue,
  value,
  label,
  onChange,
}: NodeSelectorButtonProps) {
  const isSelected = value === selectedValue?.kind;
  return (
    <button
      className={clsx(
        isSelected ? "border-blue-700" : "border-white",
        "border"
      )}
      onClick={() => onChange(isSelected ? null : getEmptyNode(value))}
    >
      {label}
    </button>
  );
}

interface NodeOptionsProps {
  node: GameNode;
  onChange: (value: GameNode) => void;
}

function NodeOptions({ node, onChange }: NodeOptionsProps) {
  switch (node.kind) {
    case "Parameter": {
      return (
        <>
          <label>
            Name
            <input
              type="text"
              value={node.name}
              onChange={(e) => onChange({ ...node, name: e.target.value })}
            />
          </label>

          <label>
            Type
            <select
              value={node.type}
              onChange={(e) =>
                onChange({
                  ...node,
                  type: e.target.value as "number" | "boolean" | "string",
                })
              }
            >
              <option value="number">Number</option>
              <option value="string">String</option>
              <option value="boolean">Boolean</option>
            </select>
          </label>
        </>
      );
    }
    case "NumericLiteral": {
      return (
        <input
          type="number"
          value={node.value}
          onChange={(e) => onChange({ ...node, value: Number(e.target.value) })}
        />
      );
    }
    case "StringLiteral": {
      return (
        <input
          type="text"
          value={node.value}
          onChange={(e) => onChange({ ...node, value: e.target.value })}
        />
      );
    }
    case "Identifier": {
      return (
        <>
          <label>
            Name
            <input
              type="text"
              value={node.name}
              onChange={(e) => onChange({ ...node, name: e.target.value })}
            />
          </label>

          <label>
            Type
            <select
              value={node.type}
              onChange={(e) =>
                onChange({
                  ...node,
                  type: e.target.value as
                    | "infer"
                    | "number"
                    | "boolean"
                    | "string",
                })
              }
            >
              <option value="infer">Infer</option>
              <option value="number">Number</option>
              <option value="string">String</option>
              <option value="boolean">Boolean</option>
            </select>
          </label>
        </>
      );
    }
    case "BinaryExpression": {
      return (
        <select
          onChange={(event) => {
            onChange({
              ...node,
              operator: Number(event.target.value) as ts.BinaryOperator,
            });
          }}
        >
          {[
            ts.SyntaxKind.PlusToken,
            ts.SyntaxKind.MinusToken,
            ts.SyntaxKind.AsteriskToken,
            ts.SyntaxKind.SlashToken,
            ts.SyntaxKind.GreaterThanToken,
            ts.SyntaxKind.GreaterThanEqualsToken,
            ts.SyntaxKind.LessThanToken,
            ts.SyntaxKind.LessThanEqualsToken,
            ts.SyntaxKind.EqualsEqualsEqualsToken,
            ts.SyntaxKind.AmpersandAmpersandToken,
            ts.SyntaxKind.BarBarToken,
            ts.SyntaxKind.PercentToken,
            ts.SyntaxKind.AsteriskAsteriskToken,
          ].map((token) => (
            <option key={token} value={token}>
              {ts.tokenToString(token)}
            </option>
          ))}
        </select>
      );
    }
    default: {
      return null;
    }
  }
}

interface RenderNodeProps extends Omit<GroupProps, "position" | "rotation"> {
  node: GameNode;
  x: number;
  y: number;
  color?: string;
}

function RenderNode({ node, ...props }: RenderNodeProps) {
  switch (node.kind) {
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
    case "Identifier": {
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

export interface TextNodeProps extends CubeProps {
  value: string | number;
}

export function TextNode({ value, x, y, color, ...props }: TextNodeProps) {
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

export function Cube({ color = "#000fff", x = 0, y = 0, ...props }: CubeProps) {
  return (
    <group {...props} position={[x, 0.5, y]}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}
