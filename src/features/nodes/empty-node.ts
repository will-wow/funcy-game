import { ts } from "ts-morph";

import { GameNode } from "./nodes";

export function generateNodeId(): string {
  return crypto.randomUUID();
}

export function getEmptyNode<T extends GameNode>(
  partial: Partial<T> & Pick<T, "kind">
): GameNode {
  const { id: partialId, kind, x = 0, y = 0 } = partial;
  const id = partialId || generateNodeId();

  switch (kind) {
    case "FunctionDeclaration": {
      return {
        name: "f1",
        width: 16,
        height: 8,
        ...partial,
        kind,
        id,
        x,
        y,
      };
    }
    case "CallExpression": {
      return {
        inputs: [],
        output: null,
        ...partial,
        kind,
        id,
        x,
        y,
      };
    }
    case "Identifier": {
      return {
        inputs: [null],
        output: null,
        ...partial,
        kind,
        id,
        x,
        y,
      };
    }
    case "Parameter": {
      return {
        name: "p1",
        type: "number",
        array: false,
        outputs: [],
        ...partial,
        kind,
        id,
        x,
        y,
      };
    }
    case "VariableStatement": {
      return {
        name: "",
        type: "number",
        array: false,
        inputs: [null],
        outputs: [],
        ...partial,
        kind,
        id,
        x,
        y,
      };
    }
    case "ElementAccessExpression": {
      return {
        inputs: [null, null],
        output: null,
        ...partial,
        kind,
        id,
        x,
        y,
      };
    }
    case "ReturnStatement": {
      return {
        inputs: [null],
        ...partial,
        kind,
        id,
        x,
        y,
        type: "infer",
        array: false,
      };
    }
    case "StringLiteral": {
      return {
        value: "",
        output: null,
        ...partial,
        kind,
        id,
        x,
        y,
      };
    }
    case "NumericLiteral": {
      return {
        value: 1,
        output: null,
        ...partial,
        id,
        kind,
        x,
        y,
      };
    }
    case "BinaryExpression": {
      return {
        operator: ts.SyntaxKind.PlusToken,
        output: null,
        inputs: [null, null],
        ...partial,
        kind,
        id,
        x,
        y,
      };
    }
    case "ConditionalExpression": {
      return {
        output: null,
        inputs: [null, null, null],
        kind,
        id,
        x,
        y,
      };
    }
    default: {
      throw new Error(`Unknown node kind, ${kind}`);
    }
  }
}
