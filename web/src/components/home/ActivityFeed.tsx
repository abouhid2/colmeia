import { Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router";
import type { Completion, Member } from "../../domain/types";
import { timeAgo } from "../../lib/dates";
import { Avatar } from "../ui/Avatar";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { SectionHeading } from "../ui/SectionHeading";

interface ActivityFeedProps {
  completions: Completion[];
  lookup(id: number | null): Member | null;
}

export function ActivityFeed({ completions, lookup }: ActivityFeedProps) {
  const { search } = useLocation();

  return (
    <section>
      <SectionHeading title="Últimas tarefas feitas" />
      {completions.length === 0 ? (
        <EmptyState icon={<Sparkles className="size-6" />} title="Nada concluído ainda" hint="A primeira tarefa feita aparece aqui." />
      ) : (
        <Card>
          <ul className="divide-y divide-line">
            {completions.map((completion) => {
              const member = lookup(completion.memberId);
              return (
                <li key={completion.id} className="flex items-center gap-3 px-4 py-3">
                  {member ? (
                    <Link to={{ pathname: `/familia/${member.id}`, search }} className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-80">
                      <Avatar member={member} size="sm" />
                      <p className="min-w-0 flex-1 truncate text-sm">
                        <span className="font-semibold">{member.name}</span> <span className="text-ink-soft">·</span> {completion.taskTitle}
                      </p>
                    </Link>
                  ) : (
                    <>
                      <span className="size-8 rounded-full bg-dune-100" />
                      <p className="min-w-0 flex-1 truncate text-sm">
                        <span className="font-semibold">Alguém</span> <span className="text-ink-soft">·</span> {completion.taskTitle}
                      </p>
                    </>
                  )}
                  <span className="text-xs text-ink-faint">{timeAgo(completion.completedAt)}</span>
                  <span className="font-display text-sm font-bold tabular-nums text-honey-700">+{completion.pointsAwarded}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </section>
  );
}
