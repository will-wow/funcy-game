import { Center } from "$elements/Center";
import { Heading } from "$elements/Heading";
import { LevelSelector } from "$levels/LevelSelector";

export default async function GamePage() {
  return (
    <Center className="h-screen">
      <Heading as="h1">Select a level</Heading>
      <LevelSelector />
    </Center>
  );
}
