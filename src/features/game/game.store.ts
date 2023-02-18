import { useMemo } from "react";
import { Vector3 } from "three";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  removeConnectionFromNodes,
  removeNodeFromNodes,
} from "$nodes/game-notes";
import { GameNode, NullableNodeId } from "$nodes/nodes";

export type GameMode = "select" | "place" | "connect" | "remove";

interface GameStore {
  nodes: Record<string, GameNode>;
  mode: GameMode;
  nodeToPlace: GameNode | null;
  selectedNode: string | null;
  focusPoint: Vector3 | null;
}

const DEFAULT_FUNCTION: Record<string, GameNode> = {
  abs: {
    name: "abs",
    width: 26,
    height: 8,
    kind: "FunctionDeclaration",
    x: 0,
    y: 0,
    id: "abs",
  },
  return: {
    inputs: ["0f9be3e9-1718-4c10-bcd1-00fb6a4ae095"],
    kind: "ReturnStatement",
    x: 12,
    y: 0,
    id: "return",
  },
  "7c84f835-6c94-4f64-9dc2-cfd6249c2d56": {
    operator: 33,
    output: "0f9be3e9-1718-4c10-bcd1-00fb6a4ae095",
    inputs: [
      "bd273cf2-7715-40ac-9f98-b981ba73daa4",
      "48b29fb6-1464-43e4-941d-637db8931e21",
    ],
    kind: "BinaryExpression",
    id: "7c84f835-6c94-4f64-9dc2-cfd6249c2d56",
    x: -9,
    y: 0,
  },
  "48b29fb6-1464-43e4-941d-637db8931e21": {
    value: 0,
    output: "7c84f835-6c94-4f64-9dc2-cfd6249c2d56",
    kind: "NumericLiteral",
    id: "48b29fb6-1464-43e4-941d-637db8931e21",
    x: -9,
    y: 2,
  },
  "0f9be3e9-1718-4c10-bcd1-00fb6a4ae095": {
    output: "return",
    inputs: [
      "7c84f835-6c94-4f64-9dc2-cfd6249c2d56",
      "bd273cf2-7715-40ac-9f98-b981ba73daa4",
      "a92adbac-aae6-4bf2-b439-51d1200dbcd8",
    ],
    kind: "ConditionalExpression",
    id: "0f9be3e9-1718-4c10-bcd1-00fb6a4ae095",
    x: 0,
    y: 0,
  },
  "bd273cf2-7715-40ac-9f98-b981ba73daa4": {
    name: "x",
    type: "number",
    array: false,
    outputs: [
      "7c84f835-6c94-4f64-9dc2-cfd6249c2d56",
      "0f9be3e9-1718-4c10-bcd1-00fb6a4ae095",
      "a92adbac-aae6-4bf2-b439-51d1200dbcd8",
    ],
    kind: "Parameter",
    id: "bd273cf2-7715-40ac-9f98-b981ba73daa4",
    x: -12,
    y: -3,
  },
  "a92adbac-aae6-4bf2-b439-51d1200dbcd8": {
    operator: 41,
    output: "0f9be3e9-1718-4c10-bcd1-00fb6a4ae095",
    inputs: [
      "d56a4324-616e-4308-85b8-717ad88082bf",
      "bd273cf2-7715-40ac-9f98-b981ba73daa4",
    ],
    kind: "BinaryExpression",
    id: "a92adbac-aae6-4bf2-b439-51d1200dbcd8",
    x: -1,
    y: 2,
  },
  "d56a4324-616e-4308-85b8-717ad88082bf": {
    value: -1,
    output: "a92adbac-aae6-4bf2-b439-51d1200dbcd8",
    kind: "NumericLiteral",
    id: "d56a4324-616e-4308-85b8-717ad88082bf",
    x: 2,
    y: 2,
  },
  "6167244b-cb78-4f0c-88b8-ea3acc99bade": {
    name: "size",
    width: 16,
    height: 8,
    kind: "FunctionDeclaration",
    id: "6167244b-cb78-4f0c-88b8-ea3acc99bade",
    x: -5,
    y: 10,
  },
  "dd18aa02-c607-46b1-9418-95634525e767": {
    name: "length",
    type: "number",
    array: false,
    outputs: ["4c9b477a-6558-42b5-99d1-b65bc2e695f6"],
    kind: "Parameter",
    id: "dd18aa02-c607-46b1-9418-95634525e767",
    x: -12,
    y: 7,
  },
  "aeb896d9-607f-4360-b3d6-224e0f5e2162": {
    output: "622425b1-311f-4cec-94b6-f465dd65ad57",
    inputs: [
      "4c9b477a-6558-42b5-99d1-b65bc2e695f6",
      "7a3ac968-96cc-440a-acc3-2f08dd7c541f",
      "01607fdd-7889-443f-9c79-351023cf5ca5",
    ],
    kind: "ConditionalExpression",
    id: "aeb896d9-607f-4360-b3d6-224e0f5e2162",
    x: -2,
    y: 10,
  },
  absRef: {
    inputs: ["abs"],
    output: "4c9b477a-6558-42b5-99d1-b65bc2e695f6",
    kind: "Identifier",
    id: "absRef",
    x: -11,
    y: 10,
  },
  "4c9b477a-6558-42b5-99d1-b65bc2e695f6": {
    inputs: ["absRef", "dd18aa02-c607-46b1-9418-95634525e767"],
    output: "aeb896d9-607f-4360-b3d6-224e0f5e2162",
    kind: "CallExpression",
    id: "4c9b477a-6558-42b5-99d1-b65bc2e695f6",
    x: -9,
    y: 10,
  },
  "7a3ac968-96cc-440a-acc3-2f08dd7c541f": {
    value: "big",
    output: "aeb896d9-607f-4360-b3d6-224e0f5e2162",
    kind: "StringLiteral",
    id: "7a3ac968-96cc-440a-acc3-2f08dd7c541f",
    x: -4,
    y: 8,
  },
  "01607fdd-7889-443f-9c79-351023cf5ca5": {
    value: "small",
    output: "aeb896d9-607f-4360-b3d6-224e0f5e2162",
    kind: "StringLiteral",
    id: "01607fdd-7889-443f-9c79-351023cf5ca5",
    x: -4,
    y: 12,
  },
  "622425b1-311f-4cec-94b6-f465dd65ad57": {
    inputs: ["aeb896d9-607f-4360-b3d6-224e0f5e2162"],
    kind: "ReturnStatement",
    id: "622425b1-311f-4cec-94b6-f465dd65ad57",
    x: 2,
    y: 10,
  },
  "50e40bac-735f-433f-8fe8-e41ffc64d395": {
    name: "absAdd",
    width: 16,
    height: 8,
    kind: "FunctionDeclaration",
    id: "50e40bac-735f-433f-8fe8-e41ffc64d395",
    x: -5,
    y: 19,
  },
  "7c24726a-25a2-47a9-b88f-7d753ca796d2": {
    name: "x",
    type: "number",
    outputs: ["dbe19cf1-e1a0-4ebb-87e4-7339486ccee7"],
    kind: "Parameter",
    id: "7c24726a-25a2-47a9-b88f-7d753ca796d2",
    x: -12,
    y: 16,
    array: true,
  },
  "dbe19cf1-e1a0-4ebb-87e4-7339486ccee7": {
    inputs: [
      "7c24726a-25a2-47a9-b88f-7d753ca796d2",
      "f7f54e0a-f169-4113-aa43-ad8a4c012e9f",
    ],
    output: "369a82d4-394e-4555-8810-8da74ff2c21f",
    kind: "ElementAccessExpression",
    id: "dbe19cf1-e1a0-4ebb-87e4-7339486ccee7",
    x: -9,
    y: 18,
  },
  "f7f54e0a-f169-4113-aa43-ad8a4c012e9f": {
    value: "map",
    output: "dbe19cf1-e1a0-4ebb-87e4-7339486ccee7",
    kind: "StringLiteral",
    id: "f7f54e0a-f169-4113-aa43-ad8a4c012e9f",
    x: -9,
    y: 20,
  },
  "369a82d4-394e-4555-8810-8da74ff2c21f": {
    inputs: [
      "dbe19cf1-e1a0-4ebb-87e4-7339486ccee7",
      "6cb2ca83-108e-44fa-bb24-99ef640a538f",
    ],
    output: "ee3910d6-8ca4-41fe-bce5-1fffc290329b",
    kind: "CallExpression",
    id: "369a82d4-394e-4555-8810-8da74ff2c21f",
    x: -7,
    y: 18,
  },
  "6cb2ca83-108e-44fa-bb24-99ef640a538f": {
    inputs: ["abs"],
    output: "369a82d4-394e-4555-8810-8da74ff2c21f",
    kind: "Identifier",
    id: "6cb2ca83-108e-44fa-bb24-99ef640a538f",
    x: -7,
    y: 20,
  },
  "ee3910d6-8ca4-41fe-bce5-1fffc290329b": {
    inputs: [
      "369a82d4-394e-4555-8810-8da74ff2c21f",
      "e3c6d24e-5292-4ad6-a61f-40311a7f6b5a",
    ],
    output: "5388a838-4aba-4493-8b4f-7236fd171500",
    kind: "ElementAccessExpression",
    id: "ee3910d6-8ca4-41fe-bce5-1fffc290329b",
    x: -4,
    y: 18,
  },
  "e3c6d24e-5292-4ad6-a61f-40311a7f6b5a": {
    value: "join",
    output: "ee3910d6-8ca4-41fe-bce5-1fffc290329b",
    kind: "StringLiteral",
    id: "e3c6d24e-5292-4ad6-a61f-40311a7f6b5a",
    x: -4,
    y: 20,
  },
  "5388a838-4aba-4493-8b4f-7236fd171500": {
    inputs: ["ee3910d6-8ca4-41fe-bce5-1fffc290329b"],
    output: "e1060160-1b4c-40f7-ad01-a84b3efa14b1",
    kind: "CallExpression",
    id: "5388a838-4aba-4493-8b4f-7236fd171500",
    x: -2,
    y: 18,
  },
  "140b54c9-f361-4800-898f-7f0e0a2bee33": {
    value: ",",
    output: null,
    kind: "StringLiteral",
    id: "140b54c9-f361-4800-898f-7f0e0a2bee33",
    x: -2,
    y: 20,
  },
  "e1060160-1b4c-40f7-ad01-a84b3efa14b1": {
    inputs: ["5388a838-4aba-4493-8b4f-7236fd171500"],
    kind: "ReturnStatement",
    id: "e1060160-1b4c-40f7-ad01-a84b3efa14b1",
    x: 2,
    y: 18,
  },
  "1646ec32-84e1-4617-8a5c-41b4216e893e": {
    name: "add",
    width: 16,
    height: 8,
    kind: "FunctionDeclaration",
    id: "1646ec32-84e1-4617-8a5c-41b4216e893e",
    x: -5,
    y: 28,
  },
  "ddc93c71-fd9b-4192-b34c-74984d16a134": {
    name: "x",
    type: "number",
    array: false,
    outputs: ["58d58ab6-c6c6-4491-9a3d-764508b8c2bd"],
    kind: "Parameter",
    id: "ddc93c71-fd9b-4192-b34c-74984d16a134",
    x: -12,
    y: 25,
  },
  "84f9d867-495b-40a1-ab85-7f91451dd93d": {
    name: "y",
    type: "number",
    array: false,
    outputs: ["58d58ab6-c6c6-4491-9a3d-764508b8c2bd"],
    kind: "Parameter",
    id: "84f9d867-495b-40a1-ab85-7f91451dd93d",
    x: -12,
    y: 29,
  },
  "367d1f41-8ba8-4cd2-ad5d-f39bbff4fc68": {
    inputs: ["58d58ab6-c6c6-4491-9a3d-764508b8c2bd"],
    kind: "ReturnStatement",
    id: "367d1f41-8ba8-4cd2-ad5d-f39bbff4fc68",
    x: 2,
    y: 28,
  },
  "58d58ab6-c6c6-4491-9a3d-764508b8c2bd": {
    operator: 39,
    output: "367d1f41-8ba8-4cd2-ad5d-f39bbff4fc68",
    inputs: [
      "ddc93c71-fd9b-4192-b34c-74984d16a134",
      "84f9d867-495b-40a1-ab85-7f91451dd93d",
    ],
    kind: "BinaryExpression",
    id: "58d58ab6-c6c6-4491-9a3d-764508b8c2bd",
    x: -6,
    y: 28,
  },
  "497b0788-25f4-42df-8d9d-f11871c25fdd": {
    name: "sum",
    width: 16,
    height: 8,
    kind: "FunctionDeclaration",
    id: "497b0788-25f4-42df-8d9d-f11871c25fdd",
    x: 12,
    y: 28,
  },
  "a369d827-62ae-412f-820e-39aba3022572": {
    name: "xs",
    type: "number",
    array: true,
    outputs: ["e96e208e-ae1a-4b9c-beb1-083389cf23ad"],
    kind: "Parameter",
    id: "a369d827-62ae-412f-820e-39aba3022572",
    x: 5,
    y: 25,
  },
  "e96e208e-ae1a-4b9c-beb1-083389cf23ad": {
    inputs: [
      "a369d827-62ae-412f-820e-39aba3022572",
      "ef3a9caa-adb3-47a9-a036-4628176100e7",
    ],
    output: "4fa67e3c-5df8-4ae3-bd0b-95cec92f4a84",
    kind: "ElementAccessExpression",
    id: "e96e208e-ae1a-4b9c-beb1-083389cf23ad",
    x: 7,
    y: 27,
  },
  "ef3a9caa-adb3-47a9-a036-4628176100e7": {
    value: "reduce",
    output: "e96e208e-ae1a-4b9c-beb1-083389cf23ad",
    kind: "StringLiteral",
    id: "ef3a9caa-adb3-47a9-a036-4628176100e7",
    x: 7,
    y: 29,
  },
  "4c6e4ed2-1b41-4813-b343-7f663dc402d5": {
    inputs: ["4fa67e3c-5df8-4ae3-bd0b-95cec92f4a84"],
    kind: "ReturnStatement",
    id: "4c6e4ed2-1b41-4813-b343-7f663dc402d5",
    x: 19,
    y: 28,
  },
  "4fa67e3c-5df8-4ae3-bd0b-95cec92f4a84": {
    inputs: [
      "e96e208e-ae1a-4b9c-beb1-083389cf23ad",
      "45c31568-70e8-4d43-9b3c-7cd605ff986d",
    ],
    output: "4c6e4ed2-1b41-4813-b343-7f663dc402d5",
    kind: "CallExpression",
    id: "4fa67e3c-5df8-4ae3-bd0b-95cec92f4a84",
    x: 9,
    y: 27,
  },
  "45c31568-70e8-4d43-9b3c-7cd605ff986d": {
    inputs: ["1646ec32-84e1-4617-8a5c-41b4216e893e"],
    output: "4fa67e3c-5df8-4ae3-bd0b-95cec92f4a84",
    kind: "Identifier",
    id: "45c31568-70e8-4d43-9b3c-7cd605ff986d",
    x: 9,
    y: 29,
  },
};

const useGameStore = create(
  devtools<GameStore>(
    () => ({
      nodes: DEFAULT_FUNCTION,
      mode: "select",
      nodeToPlace: null,
      selectedNode: null,
      focusPoint: null,
    }),
    {
      name: "gameStore",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);

declare global {
  interface Window {
    gameStore: typeof useGameStore;
  }
}

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  window.gameStore = useGameStore;
}

export const useMode = () => {
  return useGameStore((state) => state.mode);
};

export const getMode = () => {
  return useGameStore.getState().mode;
};

export const setMode = (mode: GameStore["mode"]) => {
  const update: Partial<GameStore> = { mode };
  useGameStore.setState(update);
};

export const useNodeToPlace = () => {
  return useGameStore((state) => state.nodeToPlace);
};

export const setNodeToPlace = (node: GameNode | null) => {
  useGameStore.setState({ nodeToPlace: node });
};

export const getNodeToPlace = () => {
  return useGameStore.getState().nodeToPlace;
};

export const resetNodes = () => {
  useGameStore.setState({ nodes: DEFAULT_FUNCTION });
};

export function useFocusPoint() {
  return useGameStore((state) => state.focusPoint || new Vector3());
}

export function setFocusPoint(focusPoint: Vector3 | null) {
  useGameStore.setState({ focusPoint });
}

export const useSelectedNode = () => {
  return useGameStore((state) => {
    if (!state.selectedNode) return null;

    return state.nodes[state.selectedNode];
  });
};

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

export const getSelectedNode = () => {
  const state = useGameStore.getState();
  if (!state.selectedNode) return null;

  return state.nodes[state.selectedNode];
};

export const setSelectedNode = (id: string | null) => {
  useGameStore.setState({ selectedNode: id });
};

export const useNodes = () => {
  return useGameStore((state) => state.nodes);
};

export const getNodes = () => {
  return useGameStore.getState().nodes;
};

export function useNodesOfType<T extends GameNode>(kind: T["kind"]): T[] {
  const nodes = useGameStore((state) => state.nodes);
  return useMemo(() => {
    return Object.values(nodes).filter((node) => node.kind === kind) as T[];
  }, [kind, nodes]);
}

export const useGetNode = (nodeId: NullableNodeId) => {
  return useGameStore((state) => {
    if (!nodeId) return null;
    return state.nodes[nodeId] || null;
  });
};

export const useNodesList = () => {
  const nodes = useGameStore((state) => state.nodes);
  return useMemo(() => Object.values(nodes), [nodes]);
};

export const removeNode = (id: string) => {
  const { nodes } = useGameStore.getState();

  useGameStore.setState({
    nodes: removeNodeFromNodes(nodes, id),
  });
};

export const removeConnection = (id: string, inputIndex: number) => {
  const { nodes } = useGameStore.getState();

  useGameStore.setState({
    nodes: removeConnectionFromNodes(nodes, nodes[id], inputIndex),
  });
};

export const setNode = (node: GameNode) => {
  const nodes = useGameStore.getState().nodes;
  useGameStore.setState({
    nodes: {
      ...nodes,
      [node.id]: node,
    },
  });
};

export const updateNodes = (newNodes: Record<string, GameNode>) => {
  const nodes = useGameStore.getState().nodes;
  useGameStore.setState({
    nodes: {
      ...nodes,
      ...newNodes,
    },
  });
};
