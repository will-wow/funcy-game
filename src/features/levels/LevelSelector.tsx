import NextLink from "next/link";

import { levels } from "./levels";

export function LevelSelector() {
  return (
    <div className="flex flex-col gap-2">
      {Object.entries(levels).map(([levelId, level]) => (
        <NextLink
          className="btn btn-blue"
          href={`/levels/${levelId}`}
          key={levelId}
        >
          {level.name}
        </NextLink>
      ))}
    </div>
  );
}
