import { Suspense } from "react";

import { Game } from "$game/Game";

export default async function GamePage() {
  return (
    <Suspense
      fallback={
        <div>
          <h1 className="text-5xl">Loading...</h1>
        </div>
      }
    >
      <Game />
    </Suspense>
  );
}
