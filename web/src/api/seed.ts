import { addDays, addHours, startOfWeek, subHours, subWeeks } from "date-fns";
import type { AchievementId } from "../domain/achievements";
import { DEFAULT_CROWN_TITLE } from "../domain/crownTitles";
import { emptyNavPreferences } from "../domain/navigation";
import { DEFAULT_SEASON_TITLES, defaultSeasonTitles } from "../domain/seasonTitles";
import { toIsoDate } from "../lib/dates";
import type { Completion, Member, SeasonTitleVote, ShoppingItem, Task } from "../domain/types";
import {
  DEMO_INVITE_CODE, EXAMPLE_ENTRY_MEMBER, EXAMPLE_HOUSEHOLD_NAME,
  type LocalState, type StoredSeason,
} from "./localState";

/** The estação that closed, and the one running now. */
const PAST_SEASON_ID = 70;
const SEASON_ID = 71;
/** The colmeia's títulos, numbered in the order the default list has them. */
const FIRST_TITLE_ID = 80;

type TaskSeed = Partial<Task> & Pick<Task, "id" | "title" | "points">;
type CompletionSeed = Partial<Completion> & Pick<Completion, "id" | "taskId" | "memberId" | "taskTitle" | "taskPoints">;
type ItemSeed = Partial<ShoppingItem> & Pick<ShoppingItem, "id" | "name" | "addedById">;

/** A believable family so the example opens mid-week, with something to review and a reward in sight. */
export function buildDemoState(now: Date = new Date()): LocalState {
  const today = toIsoDate(now);
  const iso = (hoursAgo: number) => subHours(now, hoursAgo).toISOString();
  const inDays = (days: number) => toIsoDate(addDays(now, days));
  /** Mid-morning on a given weekday of the week before this one. */
  const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const lastWeek = (weekday: number) => addHours(addDays(lastWeekStart, weekday), 10).toISOString();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });

  // Two estações, so the demo opens with a championship already decided and
  // another one running: the crown comes from the closed one.
  const seasons: StoredSeason[] = [
    {
      id: PAST_SEASON_ID, name: "Estação passada", startsOn: toIsoDate(lastWeekStart),
      endsOn: toIsoDate(addDays(lastWeekStart, 6)), closedAt: weekStart.toISOString(), createdAt: lastWeekStart.toISOString(),
    },
    {
      id: SEASON_ID, name: "Estação atual", startsOn: toIsoDate(weekStart),
      endsOn: null, closedAt: null, createdAt: weekStart.toISOString(),
    },
  ];

  // Nobody has claimed a place yet: the invite link is what lets a browser in.
  const member = (
    id: number, name: string, avatar: string, color: Member["color"],
    crownTitle = DEFAULT_CROWN_TITLE, kind: Member["kind"] = "bee", favoriteAchievements: AchievementId[] = [],
  ): Member => ({
    id, name, avatar, color, crownTitle, kind, favoriteAchievements,
    navPreferences: emptyNavPreferences(),
    pointsMultiplier: kind === "lagartinha" ? 1.5 : 1, claimedAt: null, createdAt: iso(240),
  });
  // Duda is the child of the house: everything she does is worth 1,5x. Ana and
  // Bruno already pinned badges they earned, which is what the profile shows.
  const members = [
    member(1, EXAMPLE_ENTRY_MEMBER, "🦊", "pollen", DEFAULT_CROWN_TITLE, "bee", [ "firstTask", "bigTask" ]),
    member(2, "Bruno", "🐻", "sky", "Abelhão", "bee", [ "flawless" ]),
    member(3, "Clara", "🐼", "plum", "Rainha da Louça"),
    member(4, "Duda", "🦉", "leaf", DEFAULT_CROWN_TITLE, "lagartinha"),
  ];

  const task = (seed: TaskSeed): Task => ({
    seasonId: SEASON_ID,
    description: null, priority: "medium", recurrence: "none", intervalDays: null, dueOn: null,
    requiresReview: false, kidFriendly: false, status: "open", completedAt: null, assigneeId: null, createdById: null,
    createdAt: iso(200), ...seed,
  });
  const tasks = [
    task({ id: 10, title: "Trocar a resistência do chuveiro", points: 50, priority: "urgent", requiresReview: true, createdById: 1,
      description: "A resistência queimou. Comprar uma de 220V e trocar com o disjuntor desligado." }),
    task({ id: 11, title: "Limpar o banheiro", points: 20, priority: "high", recurrence: "weekly", dueOn: inDays(7), requiresReview: true, assigneeId: 2 }),
    task({ id: 12, title: "Lavar a louça do jantar", points: 5, recurrence: "daily", dueOn: today, kidFriendly: true }),
    task({ id: 13, title: "Pendurar o quadro da sala", points: 15, priority: "low", assigneeId: 2, createdById: 3 }),
    task({ id: 14, title: "Levar o lixo para fora", points: 5, recurrence: "daily", dueOn: inDays(-1), kidFriendly: true }),
    task({ id: 15, title: "Regar as plantas", points: 5, priority: "low", recurrence: "custom", intervalDays: 3, dueOn: inDays(1), assigneeId: 4, kidFriendly: true }),
    task({ id: 16, title: "Aspirar a sala e os quartos", points: 15, recurrence: "weekly", dueOn: inDays(2) }),
    task({ id: 17, title: "Trocar a roupa de cama", points: 10, recurrence: "weekly", dueOn: inDays(3), requiresReview: true }),
    task({ id: 18, title: "Organizar a despensa", points: 30, priority: "low", recurrence: "monthly", dueOn: inDays(12) }),
    task({ id: 19, title: "Lavar o carro", points: 40, requiresReview: true, status: "done", completedAt: iso(9) }),
    task({ id: 20, title: "Fazer o almoço de domingo", points: 30, status: "done", completedAt: iso(7) }),
    task({ id: 21, title: "Passar as roupas", points: 20, priority: "low", requiresReview: true, status: "done", completedAt: iso(5) }),
  ];

  const completion = (seed: CompletionSeed): Completion => ({
    seasonId: SEASON_ID,
    reviewerId: null, status: "approved", rating: null, pointsAwarded: seed.taskPoints, multiplier: 1, completedAt: iso(1), reviewedAt: null, ...seed,
  });
  const completions = [
    completion({ id: 30, taskId: 19, memberId: 1, reviewerId: 2, rating: 4, pointsAwarded: 32, taskTitle: "Lavar o carro", taskPoints: 40, completedAt: iso(9), reviewedAt: iso(8) }),
    completion({ id: 31, taskId: 20, memberId: 2, taskTitle: "Fazer o almoço de domingo", taskPoints: 30, completedAt: iso(7) }),
    completion({ id: 32, taskId: 21, memberId: 3, reviewerId: 1, rating: 5, pointsAwarded: 20, taskTitle: "Passar as roupas", taskPoints: 20, completedAt: iso(5), reviewedAt: iso(4) }),
    completion({ id: 33, taskId: 12, memberId: 4, taskTitle: "Lavar a louça do jantar", taskPoints: 5, pointsAwarded: 8, multiplier: 1.5, completedAt: iso(3) }),
    completion({ id: 34, taskId: 14, memberId: 1, taskTitle: "Levar o lixo para fora", taskPoints: 5, completedAt: iso(2) }),
    completion({ id: 35, taskId: 11, memberId: 2, status: "pending", pointsAwarded: 0, taskTitle: "Limpar o banheiro", taskPoints: 20, completedAt: iso(1) }),
    // The estação that closed: the house beat its goal and Bruno pulled ahead,
    // so he wears the crown while this one runs.
    completion({ id: 60, seasonId: PAST_SEASON_ID, taskId: null, memberId: 2, reviewerId: 1, rating: 5, pointsAwarded: 90, taskTitle: "Montar o armário do quarto", taskPoints: 90, completedAt: lastWeek(1), reviewedAt: lastWeek(1) }),
    completion({ id: 61, seasonId: PAST_SEASON_ID, taskId: null, memberId: 2, taskTitle: "Lavar o carro", taskPoints: 40, completedAt: lastWeek(4) }),
    completion({ id: 62, seasonId: PAST_SEASON_ID, taskId: null, memberId: 1, taskTitle: "Fazer a feira do mês", taskPoints: 50, completedAt: lastWeek(0) }),
    completion({ id: 63, seasonId: PAST_SEASON_ID, taskId: null, memberId: 1, taskTitle: "Limpar o quintal", taskPoints: 30, completedAt: lastWeek(3) }),
    completion({ id: 64, seasonId: PAST_SEASON_ID, taskId: null, memberId: 1, taskTitle: "Trocar as lâmpadas", taskPoints: 20, completedAt: lastWeek(5) }),
    completion({ id: 65, seasonId: PAST_SEASON_ID, taskId: null, memberId: 3, reviewerId: 2, rating: 4, pointsAwarded: 16, taskTitle: "Passar as roupas", taskPoints: 20, completedAt: lastWeek(2), reviewedAt: lastWeek(2) }),
    completion({ id: 66, seasonId: PAST_SEASON_ID, taskId: null, memberId: 3, taskTitle: "Organizar a despensa", taskPoints: 30, completedAt: lastWeek(5) }),
    completion({ id: 67, seasonId: PAST_SEASON_ID, taskId: null, memberId: 4, taskTitle: "Regar as plantas", taskPoints: 5, pointsAwarded: 8, multiplier: 1.5, completedAt: lastWeek(2) }),
    completion({ id: 68, seasonId: PAST_SEASON_ID, taskId: null, memberId: 4, taskTitle: "Lavar a louça do jantar", taskPoints: 5, pointsAwarded: 8, multiplier: 1.5, completedAt: lastWeek(5) }),
    completion({ id: 69, seasonId: PAST_SEASON_ID, taskId: null, memberId: 4, taskTitle: "Aspirar a sala e os quartos", taskPoints: 20, pointsAwarded: 30, multiplier: 1.5, completedAt: lastWeek(6) }),
  ];

  // The family also voted on the estação that closed: Bruno took the
  // Pernilongo, and the Lesma ended in a draw nobody wants to break.
  const seasonTitles = defaultSeasonTitles(FIRST_TITLE_ID);
  const titleId = (name: string) => FIRST_TITLE_ID + DEFAULT_SEASON_TITLES.findIndex((title) => title.name === name);
  const vote = (id: number, title: string, voterId: number, voteeId: number): SeasonTitleVote => ({
    id, seasonId: PAST_SEASON_ID, seasonTitleId: titleId(title), voterId, voteeId,
  });
  const titleVotes = [
    vote(90, "Pernilongo", 1, 2),
    vote(91, "Pernilongo", 3, 2),
    vote(92, "Pernilongo", 4, 1),
    vote(93, "Lesma", 1, 4),
    vote(94, "Lesma", 2, 3),
  ];

  const item = (seed: ItemSeed): ShoppingItem => ({
    quantity: null, purchased: false, purchasedById: null, purchasedAt: null, createdAt: iso(30), ...seed,
  });
  const shoppingItems = [
    item({ id: 40, name: "Leite", quantity: "2 caixas", addedById: 1 }),
    item({ id: 41, name: "Ovos", quantity: "1 dúzia", addedById: 2 }),
    item({ id: 42, name: "Detergente", addedById: 3 }),
    item({ id: 43, name: "Resistência do chuveiro 220V", addedById: 1 }),
    item({ id: 44, name: "Café", quantity: "500 g", addedById: 3 }),
    item({ id: 45, name: "Papel higiênico", quantity: "12 rolos", addedById: 4, purchased: true, purchasedById: 2, purchasedAt: iso(6) }),
  ];

  return {
    // Duda is a lagartinha, so the example shows what the switch turns on.
    household: { id: 1, name: EXAMPLE_HOUSEHOLD_NAME, inviteCode: DEMO_INVITE_CODE, demo: true, lagartinhasEnabled: true },
    members,
    seasons,
    tasks,
    completions,
    shoppingItems,
    seasonTitles,
    titleVotes,
    awards: [],
    goals: [
      { id: 53, seasonId: PAST_SEASON_ID, title: "Pizza e filme no sábado", targetPoints: 300, memberId: null },
      { id: 50, seasonId: SEASON_ID, title: "Pizza e filme no sábado", targetPoints: 300, memberId: null },
      { id: 51, seasonId: SEASON_ID, title: "Sorvete na sexta", targetPoints: 30, memberId: 4 },
      { id: 52, seasonId: SEASON_ID, title: "Escolher o filme do sábado", targetPoints: 60, memberId: 2 },
    ],
    nextId: 100,
  };
}
