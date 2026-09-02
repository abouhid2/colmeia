import { Trophy } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function GoalEmptyCard({ onCreate }: { onCreate(): void }) {
  return (
    <Card className="flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-honey-100 text-honey-700"><Trophy className="size-6" /></span>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Combinem uma recompensa</h2>
          <p className="mt-1 text-sm text-ink-soft">Uma meta de pontos para a colmeia inteira: quando o favo enche, todo mundo ganha.</p>
        </div>
      </div>
      <Button onClick={onCreate}>Criar a meta</Button>
    </Card>
  );
}
