import { Project, ts } from "ts-morph";

import { makeFunction } from "./lib/makeFunction";

import { GameNode } from "$nodes/nodes";

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
  const functionDeclaration = makeFunction(functionName, nodes);

  const generatedCode = printer.printNode(
    ts.EmitHint.Unspecified,
    functionDeclaration,
    sourceFile.compilerNode
  );

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
