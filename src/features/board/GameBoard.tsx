"use client";

import { Fragment, useCallback, useState } from "react";
import { Vector2 } from "three";

import {
  removeNode,
  setNode,
  setSelectedNode,
  updateNodes,
  useMode,
  useNodes,
  useNodeToPlace,
  useSelectedNode,
} from "$game/game.store";
import { generateNodeId } from "$nodes/empty-node";
import {
  isCalculatedNode,
  isExpressionNode,
  isVariableNode,
} from "$nodes/nodes";
import { solarized } from "$utils/dracula";

import { setInputOnNode, setOutputOnNode } from "../nodes/input-output";

import { PlayArea } from "./components/PlayArea";
import { Connection, ConnectionToNode } from "./nodes/Connection";
import { RenderNode } from "./nodes/RenderNode";

export function GameBoard() {
  const [hoverPoint, setHoverPoint] = useState<Vector2 | null>(null);
  const mode = useMode();
  const nodeToPlace = useNodeToPlace();
  const selectedNode = useSelectedNode();
  const nodes = useNodes();

  const handlePlayAreaClick = useCallback(
    ({ x, y }: Vector2) => {
      if (mode === "place" && nodeToPlace) {
        setNode({
          ...nodeToPlace,
          x,
          y,
          id: generateNodeId(),
        });
      } else {
        setSelectedNode(null);
      }
    },
    [mode, nodeToPlace]
  );

  return (
    <PlayArea onHover={setHoverPoint} onClick={handlePlayAreaClick}>
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
              color={selectedNode?.id === node.id ? "#400400" : "#000fff"}
              x={node.x}
              y={node.y}
              onClick={(e) => {
                e.stopPropagation();

                if (
                  mode === "place" &&
                  node.kind === "FunctionDeclaration" &&
                  nodeToPlace
                ) {
                  const x = Math.round(e.point.x);
                  const y = Math.round(e.point.z);
                  const id = generateNodeId();
                  setNode({
                    ...nodeToPlace,
                    x,
                    y,
                    id,
                  });
                  setSelectedNode(id);
                } else if (mode === "select") {
                  setSelectedNode(node.id);
                } else if (mode === "remove") {
                  removeNode(node.id);
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

                    updateNodes({
                      [node.id]: nodeWithInput,
                      [selectedNode.id]: selectedNodeWithOutput,
                    });

                    setSelectedNode(null);
                  } else {
                    setSelectedNode(node.id);
                  }
                }
              }}
            />

            {isExpressionNode(node) && node.output && (
              <ConnectionToNode
                startNode={node}
                endNode={nodes[node.output]}
                color={solarized.green}
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
                    color={solarized.green}
                  />
                ))}
              </>
            )}
          </Fragment>
        );
      })}
    </PlayArea>
  );
}
