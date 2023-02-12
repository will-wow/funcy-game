import { Project, ts } from "ts-morph";

import { GameNode, isFunctionNode } from "$nodes/nodes";

import { makeFunction } from "./lib/makeFunction";

const project = new Project({
  useInMemoryFileSystem: true,
  compilerOptions: {
    strict: true,
    forceConsistentCasingInFileNames: true,
  },
});

const sourceFile = project.createSourceFile("file.ts");

const printer = ts.createPrinter();

/** Compile a set of nodes into a program. */
export async function compileNodes(
  functionName: string,
  nodes: Record<string, GameNode>
) {
  const functions = Object.values(nodes).filter(isFunctionNode);

  const generatedCode = functions
    .map((fn) => {
      const functionDeclaration = makeFunction(fn, nodes);

      return printer.printNode(
        ts.EmitHint.Unspecified,
        functionDeclaration,
        sourceFile.compilerNode
      );
    })
    .join("\n\n");

  sourceFile.replaceWithText(generatedCode);

  const diagnostics = project.getPreEmitDiagnostics();

  if (diagnostics.length) {
    console.error(
      generatedCode,
      diagnostics.map((diag) => diag.getMessageText())
    );
  }
  return { generatedCode, diagnostics };
}
