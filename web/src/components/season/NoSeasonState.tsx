import { CalendarRange } from "lucide-react";
import { Link, useLocation } from "react-router";
import { EmptyState } from "../ui/EmptyState";

/** A colmeia with no estação has nowhere to put a task, so there is one thing to do. */
export function NoSeasonState() {
  const { search } = useLocation();
  return (
    <EmptyState
      icon={<CalendarRange className="size-6" />}
      title="Esta colmeia ainda não tem estação"
      hint="Uma estação é um campeonato com as suas tarefas, metas e ranking. Abra a primeira para começar."
      action={
        <Link
          to={{ pathname: "/estacoes", search }}
          className="inline-flex h-10 items-center rounded-full bg-honey-500 px-4 text-sm font-semibold text-honey-900 hover:bg-honey-400"
        >
          Abrir uma estação
        </Link>
      }
    />
  );
}
