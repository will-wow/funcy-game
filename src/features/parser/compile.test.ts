import { GameNode } from "$nodes/nodes";

import { compileNodes } from "./compile";

describe("generateSourceCode", () => {
  it("should generate simple source code", async () => {
    const nodes: Record<string, GameNode> = {
      identity: {
        name: "identity",
        width: 16,
        height: 8,
        kind: "FunctionDeclaration",
        id: "identity",
        x: -1,
        y: 0,
      },
      p1: {
        kind: "Parameter",
        id: "p1",
        name: "p1",
        type: "number",
        outputs: ["return"],
        x: 0,
        y: 0,
        array: false,
      },
      return: {
        kind: "ReturnStatement",
        id: "return",
        inputs: ["p1"],
        x: 0,
        y: 0,
      },
    };

    const { generatedCode, diagnostics, js } = await compileNodes(nodes);

    expect(diagnostics).toEqual([]);
    expect(generatedCode).toBe(
      [
        // Function
        "function identity(p1: number) {",
        "    return p1;",
        "}",
      ].join("\n")
    );
    expect(js).toBe(
      [
        // Function
        '"use strict";',
        "function identity(p1) {",
        "    return p1;",
        "}",
        "",
      ].join("\n")
    );
  });
});
