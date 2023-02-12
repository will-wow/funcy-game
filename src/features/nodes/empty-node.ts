import { ts } from "ts-morph";

import { GameNode } from "./nodes";

export function getEmptyNode<T extends GameNode>(
  partial: Partial<T> & Pick<T, "kind">
): GameNode {
  const { id: partialId, kind, x = 0, y = 0 } = partial;
  const id = partialId || crypto.randomUUID();

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
    case "Parameter": {
      return {
        name: "p1",
        type: "number",
        outputs: [],
        function: null,
        ...partial,
        kind,
        id,
        x,
        y,
      };
    }
    case "Identifier": {
      return {
        name: "",
        type: "number",
        inputs: [null],
        outputs: [],
        function: null,
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
        function: null,
        ...partial,
        kind,
        id,
        x,
        y,
      };
    }
    case "StringLiteral": {
      return {
        value: "",
        output: null,
        function: null,
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
        function: null,
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
        function: null,
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
