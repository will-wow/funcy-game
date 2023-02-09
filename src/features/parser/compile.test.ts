import { GameNode } from "$nodes/nodes";

import { compileNodes } from "./compile";

describe("generateSourceCode", () => {
  it("should generate simple source code", async () => {
    const nodes: Record<string, GameNode> = {
      p1: {
        kind: "Parameter",
        id: "p1",
        name: "p1",
        type: "number",
        outputs: ["return"],
        x: 0,
        y: 0,
      },
      return: {
        kind: "ReturnStatement",
        id: "return",
        inputs: ["p1"],
        x: 0,
        y: 0,
      },
    };

    const { generatedCode, diagnostics } = await compileNodes("basic", nodes);

    expect(diagnostics).toEqual([]);
    expect(generatedCode).toBe(
      [
        // Function
        "function basic(p1: number): number {",
        "    return p1;",
        "}",
      ].join("\n")
    );
  });
});
