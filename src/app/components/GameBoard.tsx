"use client";

import { Fragment, useMemo, useState } from "react";
import { Canvas, GroupProps, MeshProps } from "@react-three/fiber";
import {
  Center,
  Environment,
  OrbitControls,
  PerspectiveCamera,
  Plane,
  Sky,
  Text3D,
} from "@react-three/drei";
import { ts } from "@ts-morph/bootstrap";
import clsx from "clsx";
import monogram from "~/assets/monogram.json";

import {
  GameNode,
  getEmptyNode,
  isExpression,
  NodeId,
  NodeKind,
  setInputOnNode,
  testPrint,
} from "~/lib/generateSourceCode";
import { MOUSE, Shape, Vector2 } from "three";

const NINETY_DEGREES = Math.PI / 2;

const DEFAULT_FUNCTION: Record<string, GameNode> = {
  p1: {
    id: "p1",
    kind: "Parameter",
    name: "n",
    type: "NumberKeyword",
    x: -10,
    y: 0,
  },
  return: {
    id: "return",
    kind: "ReturnStatement",
    input: {
      id: "3",
    },
    x: 10,
    y: 0,
  },
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
        <Plane
          args={[100, 100]}
          rotation={[-NINETY_DEGREES, 0, 0]}
          onPointerMove={(event) => {
            const x = Math.round(event.point.x);
            const y = Math.round(event.point.z);
            setHoverPoint(new Vector2(x, y));
          }}
          onClick={(event) => {
            const x = Math.round(event.point.x);
            const y = Math.round(event.point.z);

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
        </Plane>

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
                    setNodes((nodes) => {
                      const { [node.id]: _, ...rest } = nodes;
                      return rest;
                    });
                    event.stopPropagation();
                  } else if (mode === "connect") {
                    if (selectedNode) {
                      const outputNode = setInputOnNode(node, selectedNode);

                      if (outputNode) {
                        setNodes((nodes) => {
                          return {
                            ...nodes,
                            [node.id]: outputNode,
                            [selectedNode.id]: {
                              ...selectedNode,
                              output: {
                                id: node.id,
                              },
                            },
                          };
                        });
                      }

                      setSelectedNode(null);
                    } else {
                      setSelectedNode(node);
                    }
                  }
                }}
              />

              {isExpression(node) && node.output && (
                <Connection
                  startX={node.x}
                  startY={node.y}
                  endX={nodes[node.output.id].x}
                  endY={nodes[node.output.id].y}
                  color="#000fff"
                />
              )}
            </Fragment>
          );
        })}

        <PerspectiveCamera
          makeDefault
          position={[0, 10, 0]}
          rotation={[-NINETY_DEGREES, 0, 0]}
        />

        <ambientLight intensity={0.1} />
        <directionalLight position={[0, 500, 500]} />

       <Environment preset="forest" />
        <Sky
          distance={450000}
          sunPosition={[0.5, 1, 0]}
          inclination={0}
          azimuth={0.25}
        />

        <OrbitControls
          mouseButtons={{
            MIDDLE: MOUSE.DOLLY,
            RIGHT: MOUSE.ROTATE,
          }}
					maxPolarAngle={NINETY_DEGREES-0.01}

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
        <button onClick={() => testPrint(nodes)}>Run</button>
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

export function Connection(props: ConnectionProps) {
  const { startX, startY, endX, endY, color } = props;
  if (startX !== startY && endX !== endY) {
    return <LConnection {...props} />;
  }

  const minX = Math.min(startX, endX);
  const minY = Math.min(startY, endY);
  const maxX = Math.max(startX, endX);
  const maxY = Math.max(startY, endY);

  const xLength = maxX - minX;
  const yLength = maxY - minY;

  if (startX === endX) {
    return (
      <mesh position={[minX, 0.25, minY + yLength / 2]}>
        <boxGeometry args={[0.5, 0.5, yLength]} />
        <meshStandardMaterial color={color} />
      </mesh>
    );
  }

  if (startY === endY) {
    return (
      <mesh position={[minX + xLength / 2, 0.25, minY]}>
        <boxGeometry args={[xLength, 0.5, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
    );
  }

  return null;
}

interface PlusBlockProps extends MeshProps {
  x: number;
  y: number;
  color?: string;
}

function PlusBlock({ x, y, color, ...props }: PlusBlockProps) {
  const shape = useMemo(() => {
    const shape = new Shape();

    const SHORT_LENGTH = 0.15;
    const LONG_LENGTH = 0.5;

    shape.moveTo(-SHORT_LENGTH, LONG_LENGTH);
    shape.lineTo(SHORT_LENGTH, LONG_LENGTH);
    shape.lineTo(SHORT_LENGTH, SHORT_LENGTH);
    shape.lineTo(LONG_LENGTH, SHORT_LENGTH);
    shape.lineTo(LONG_LENGTH, -SHORT_LENGTH);
    shape.lineTo(SHORT_LENGTH, -SHORT_LENGTH);
    shape.lineTo(SHORT_LENGTH, -LONG_LENGTH);
    shape.lineTo(-SHORT_LENGTH, -LONG_LENGTH);
    shape.lineTo(-SHORT_LENGTH, -SHORT_LENGTH);
    shape.lineTo(-LONG_LENGTH, -SHORT_LENGTH);
    shape.lineTo(-LONG_LENGTH, SHORT_LENGTH);
    shape.lineTo(-SHORT_LENGTH, SHORT_LENGTH);
    shape.lineTo(-SHORT_LENGTH, LONG_LENGTH);

    return shape;
  }, []);

  return (
    <mesh {...props} position={[x, 0, y]} rotation={[-NINETY_DEGREES, 0, 0]}>
      <extrudeGeometry args={[shape, { bevelEnabled: false, depth: 1 }]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function LConnection({ startX, startY, endX, endY, color }: ConnectionProps) {
  const minX = Math.min(startX, endX);
  const minY = Math.min(startY, endY);
  const maxX = Math.max(startX, endX);
  const maxY = Math.max(startY, endY);

  const xDirection = startX < endX ? 1 : -1;
  const yDirection = startY > endY ? 1 : -1;

  const xLength = maxX - minX;
  const yLength = maxY - minY;

  const shapeL = useMemo(() => {
    const shapeL = new Shape();

    const endX = xLength * xDirection;
    const endY = yLength * yDirection;
    const adjustX = 0.25 * xDirection;
    const adjustY = 0.25 * yDirection;

    shapeL.moveTo(0, -adjustY);
    shapeL.lineTo(endX + adjustX, -adjustY);
    shapeL.lineTo(endX + adjustX, endY);
    shapeL.lineTo(endX - adjustX, endY);
    shapeL.lineTo(endX - adjustX, adjustY);
    shapeL.lineTo(0, adjustY);
    shapeL.lineTo(0, -adjustY);

    return shapeL;
  }, [xDirection, yDirection, xLength, yLength]);

  return (
    <mesh position={[startX, 0, startY]} rotation={[-NINETY_DEGREES, 0, 0]}>
      <extrudeGeometry args={[shapeL, { bevelEnabled: false, depth: 0.5 }]} />
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
    case "NumericLiteral": {
      return (
        <input
          type="number"
          value={node.value}
          onChange={(e) => onChange({ ...node, value: Number(e.target.value) })}
        />
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
          <option value={ts.SyntaxKind.PlusToken}>+</option>
          <option value={ts.SyntaxKind.MinusToken}>-</option>
          <option value={ts.SyntaxKind.AsteriskToken}>*</option>
          <option value={ts.SyntaxKind.SlashToken}>/</option>
          <option value={ts.SyntaxKind.GreaterThanToken}>{">"}</option>
          <option value={ts.SyntaxKind.LessThanToken}>{"<"}</option>
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
      return <TextNode value="()" {...props} />;
    }
    case "ReturnStatement": {
      return <TextNode value="|>" {...props} />;
    }
    case "BinaryExpression": {
      return (
        <TextNode value={ts.tokenToString(node.operator) || "?"} {...props} />
      );
    }
    case "ConditionalExpression": {
      return <TextNode value="IF" {...props} />;
    }
    case "NumericLiteral": {
      return <TextNode value={node.value} {...props} />;
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
        <Text3D font={monogram} height={0.5} size={1} {...props}>
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
