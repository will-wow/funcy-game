"use client";

import { useMemo } from "react";
import { parseSource } from "~/lib/parse";
// import { SourceContext } from "./SourceContext";
import { RenderBody } from "./FlatRenderer";

interface FlatGameProps {
  sourceFile: string;
}

export function FlatGame({ sourceFile }: FlatGameProps) {
  const { source, project } = useSource(sourceFile);
  source.getChildren();
  const main = source.getFunctionOrThrow("main");
  if (!main) return null;

  const onRun = () => {
    const result = project.emitToMemory();
    const code = result.getFiles()[0].text;
    eval?.(`
			'use strict';
			(function() {
				${code}

				try {
					var result = main(new Bundle({
						steel: 1,
						tree: 4,
						ore: 1
					}));
					console.log(result)
					alert(result);
				} catch (e) {
					console.error("error", e);
					alert(e.message);
				}
			})();
		`);
  };

  return (
    <div className="relative h-full w-full text-2xl">
      <RenderBody node={main} />

      <button className="absolute top-0 right-0" onClick={onRun}>
        Run
      </button>
    </div>
  );
}

const useSource = (f: string) => {
  return useMemo(() => {
    return parseSource(f);
  }, [f]);
};
