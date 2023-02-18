import { Suspense } from "react";

import { Center } from "$elements/Center";
import { Heading } from "$elements/Heading";
import { Game } from "$game/Game";
import { isLevelName } from "$levels/levels";

export default async function GamePage({
  params: { level: levelName },
}: {
  params: { level: string };
}) {
  if (!isLevelName(levelName)) {
    return <div>Unknown level</div>;
  }

  return (
    <Suspense
      fallback={
        <Center>
          <Heading as="h1" size="lg">
            Loading...
          </Heading>
        </Center>
      }
    >
      <Game levelName={levelName} />
    </Suspense>
  );
}
