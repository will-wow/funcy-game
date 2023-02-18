import { useMemo } from "react";
import { Vector3 } from "three";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { Level } from "$levels/Level";
import {
  removeConnectionFromNodes,
  removeNodeFromNodes,
} from "$nodes/game-notes";
import { GameNode, GameNodes, NullableNodeId } from "$nodes/nodes";

export type GameMode = "select" | "place" | "connect" | "remove";

interface GameStore {
  initialNodes: GameNodes;
  nodes: GameNodes;
  mode: GameMode;
  nodeToPlace: GameNode | null;
  selectedNode: string | null;
  focusPoint: Vector3 | null;
}

const useGameStore = create(
  devtools<GameStore>(
    () => ({
      initialNodes: {},
      nodes: {},
      mode: "select",
      nodeToPlace: null,
      selectedNode: null,
      focusPoint: null,
    }),
    {
      name: "gameStore",
      enabled:
        // Only in dev mode
        process.env.NODE_ENV === "development" &&
        // Not in SSR
        typeof window !== "undefined",
    }
  )
);

/** Set up a level */
export function setLevel(level: Level) {
  useGameStore.setState({
    nodes: level.nodes,
    initialNodes: level.nodes,
    selectedNode: null,
    focusPoint: null,
    nodeToPlace: null,
  });
}

export function useMode() {
  return useGameStore((state) => state.mode);
}

export function getMode() {
  return useGameStore.getState().mode;
}

export function setMode(mode: GameStore["mode"]) {
  const update: Partial<GameStore> = { mode };
  useGameStore.setState(update);
}

export function useNodeToPlace() {
  return useGameStore((state) => state.nodeToPlace);
}

export function setNodeToPlace(node: GameNode | null) {
  useGameStore.setState({ nodeToPlace: node });
}

export function getNodeToPlace() {
  return useGameStore.getState().nodeToPlace;
}

/** Reset to the initial setup. */
export function resetNodes() {
  const { initialNodes } = useGameStore.getState();
  useGameStore.setState({
    nodes: initialNodes,
    selectedNode: null,
    focusPoint: null,
    nodeToPlace: null,
  });
}

export function useFocusPoint() {
  return useGameStore((state) => state.focusPoint || new Vector3());
}

export function setFocusPoint(focusPoint: Vector3 | null) {
  useGameStore.setState({ focusPoint });
}

export function useSelectedNode() {
  return useGameStore((state) => {
    if (!state.selectedNode) return null;

    return state.nodes[state.selectedNode];
  });
}

export function updateSelectedNode<T extends GameNode>(update: Partial<T>) {
  const { nodes } = useGameStore.getState();
  const node = getSelectedNode() as T | null;
  if (!node) return;

  useGameStore.setState({
    nodes: {
      ...nodes,
      [node.id]: {
        ...node,
        ...update,
      },
    },
  });
}

export function getSelectedNode() {
  const state = useGameStore.getState();
  if (!state.selectedNode) return null;

  return state.nodes[state.selectedNode];
}

export function setSelectedNode(id: string | null) {
  useGameStore.setState({ selectedNode: id });
}

export function useNodes() {
  return useGameStore((state) => state.nodes);
}

export function getNodes() {
  return useGameStore.getState().nodes;
}

export function useNodesOfType<T extends GameNode>(kind: T["kind"]): T[] {
  const nodes = useGameStore((state) => state.nodes);
  return useMemo(() => {
    return Object.values(nodes).filter((node) => node.kind === kind) as T[];
  }, [kind, nodes]);
}

export function useGetNode(nodeId: NullableNodeId) {
  return useGameStore((state) => {
    if (!nodeId) return null;
    return state.nodes[nodeId] || null;
  });
}

export function useNodesList() {
  const nodes = useGameStore((state) => state.nodes);
  return useMemo(() => Object.values(nodes), [nodes]);
}

export function removeNode(id: string) {
  const { nodes } = useGameStore.getState();

  useGameStore.setState({
    nodes: removeNodeFromNodes(nodes, id),
  });
}

export function removeConnection(id: string, inputIndex: number) {
  const { nodes } = useGameStore.getState();

  useGameStore.setState({
    nodes: removeConnectionFromNodes(nodes, nodes[id], inputIndex),
  });
}

export function setNode(node: GameNode) {
  const nodes = useGameStore.getState().nodes;
  useGameStore.setState({
    nodes: {
      ...nodes,
      [node.id]: node,
    },
  });
}

export function updateNodes(newNodes: Record<string, GameNode>) {
  const nodes = useGameStore.getState().nodes;
  useGameStore.setState({
    nodes: {
      ...nodes,
      ...newNodes,
    },
  });
}
