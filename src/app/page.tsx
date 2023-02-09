import { Suspense } from "react";
import { GameBoard } from "$board/GameBoard";

export default async function Game() {
  return (
    <Suspense
      fallback={
        <div>
          <h1 className="text-5xl">Loading...</h1>
        </div>
      }
    >
      <GameBoard />
    </Suspense>
  );
}
