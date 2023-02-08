import fs from "fs/promises";
import path from "path";
import { FlatGame } from "~/app/components/FlatGame";
// import { Game } from "./components/Game";

export default async function Home() {
  const sourceFile = await fs.readFile(
    path.join(process.cwd(), "./example/src/exampleScript.ts"),
    "utf-8"
  );

  return (
    <div className="h-screen">
      <FlatGame sourceFile={sourceFile} />
    </div>
  );
}
