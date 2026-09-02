import { Sparkles, Trophy } from "lucide-react";
import type { AchievementRecord } from "../domain/achievementHistory";
import { MAX_FAVORITE_ACHIEVEMENTS, type AchievementId } from "../domain/achievements";
import { useAchievementSync } from "../hooks/useAchievementAwards";
import { useMemberAchievements } from "../hooks/useMemberAchievements";
import { useMemberFilter } from "../hooks/useMemberFilter";
import { useMemberMutations } from "../hooks/useMembers";
import { useSession } from "../hooks/useSession";
import { AchievementCard } from "../components/members/AchievementCard";
import { AchievementSummary } from "../components/members/AchievementSummary";
import { MemberFilter } from "../components/members/MemberFilter";
import { EmptyState } from "../components/ui/EmptyState";
import { SectionHeading } from "../components/ui/SectionHeading";

/** One person at a time: "Todos" would only add up badges nobody earned together. */
export function AchievementsPage() {
  const { currentMember } = useSession();
  const { member: filtered } = useMemberFilter();
  const shown = filtered ?? currentMember;
  const badges = useMemberAchievements(shown);
  const { update } = useMemberMutations();
  const isSelf = shown !== null && currentMember?.id === shown.id;
  // The shell already writes down the badges of whoever is using the app.
  useAchievementSync(isSelf ? null : shown?.id ?? null);

  if (shown === null) return null;

  const pinned = shown.favoriteAchievements;
  const shelfIsFull = pinned.length >= MAX_FAVORITE_ACHIEVEMENTS;

  const togglePin = (id: AchievementId) => {
    const next = pinned.includes(id) ? pinned.filter((key) => key !== id) : [ ...pinned, id ];
    update.mutate({ id: shown.id, input: { favoriteAchievements: next } });
  };

  const card = (achievement: AchievementRecord) => (
    <AchievementCard
      key={achievement.id}
      achievement={achievement}
      pin={isSelf ? {
        pinned: pinned.includes(achievement.id),
        disabled: shelfIsFull && !pinned.includes(achievement.id),
        onToggle: () => togglePin(achievement.id),
      } : undefined}
    />
  );

  return (
    <div className="space-y-6 animate-rise">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Conquistas</h1>
        <p className="mt-1 text-sm text-ink-soft">O que já foi ganho, e o que ainda falta.</p>
      </div>

      <MemberFilter allowAll={false} fallbackId={currentMember?.id ?? null} />
      <AchievementSummary member={shown} unlocked={badges.unlocked.length} total={badges.records.length} />

      {badges.favorites.length > 0 && (
        <section>
          <SectionHeading title="Favoritas" hint={isSelf ? "As que aparecem no seu perfil." : `As que aparecem no perfil de ${shown.name}.`} />
          <ul className="grid gap-3 sm:grid-cols-2">{badges.favorites.map(card)}</ul>
        </section>
      )}

      <section>
        <SectionHeading
          title="Conquistadas"
          hint={isSelf ? `Fixe até ${MAX_FAVORITE_ACHIEVEMENTS} no seu perfil com a estrela.` : undefined}
        />
        {badges.unlocked.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="size-6" />}
            title="Nenhuma conquista ainda"
            hint="A primeira tarefa concluída abre a primeira conquista."
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">{badges.unlocked.map(card)}</ul>
        )}
      </section>

      <section>
        <SectionHeading title="Ainda não" hint="Falta pouco para algumas." />
        {badges.locked.length === 0 ? (
          <EmptyState icon={<Trophy className="size-6" />} title="Não falta nenhuma" hint={`${shown.name} já ganhou todas.`} />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {badges.locked.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
