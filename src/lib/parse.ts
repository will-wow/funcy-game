import { Project, ScriptTarget } from "ts-morph";

export function parseSource(sourceText: string) {
  const project = new Project({
    compilerOptions: {
      target: ScriptTarget.ES3,
    },
    useInMemoryFileSystem: true,
  });

  return {
    project,
    source: project.createSourceFile("source.ts", sourceText),
  };
}
