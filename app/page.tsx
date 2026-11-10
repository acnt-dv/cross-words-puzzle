import { CrosswordGame } from "@/components/crossword-game";
import { loadPuzzles } from "@/lib/load-puzzles";

export default async function Home() {
  const puzzles = await loadPuzzles();
  return <CrosswordGame puzzles={puzzles} />;
}
