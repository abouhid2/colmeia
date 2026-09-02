import type {
  AchievementAward, AchievementAwardInput, Completion, Goal, GoalInput, Household, HouseholdInput,
  HouseholdWithMembers, Member, MemberInput, ReviewInput, Season, SeasonInput, SeasonUpdate,
  ShoppingItem, ShoppingItemInput, ShoppingItemUpdate, Task, TaskInput,
} from "../domain/types";
import type { ColmeiaApi, CompleteTaskOptions, CompleteTaskResult, CompletionQuery, DemoColmeia } from "./client";
import { ApiError } from "./errors";
import { toCamelKeys, toSnakeKeys } from "./keys";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ErrorBody {
  error?: string;
  details?: string[];
}

const HOUSEHOLD_HEADER = "X-Household-Code";

const ERROR_LABELS: Record<string, string> = {
  not_found: "Isso não existe mais. Atualize a página.",
  unauthorized: "Você não está nesta colmeia. Abra o link do convite de novo.",
  conflict: "Alguém mexeu nisso antes de você. Atualize a página.",
  invalid: "Faltou alguma coisa. Confira o que você escreveu.",
  bad_request: "Não deu para entender o pedido. Tente de novo.",
};

/** "/tasks?season_id=7", or "/tasks" when the whole colmeia is meant. */
function scopedPath(path: string, seasonId: number | null | undefined): string {
  return seasonId === null || seasonId === undefined ? path : `${path}?season_id=${seasonId}`;
}

function completionsPath({ seasonId, limit }: CompletionQuery): string {
  const query = new URLSearchParams();
  if (seasonId !== null && seasonId !== undefined) query.set("season_id", String(seasonId));
  if (limit !== undefined) query.set("limit", String(limit));
  const search = query.toString();
  return search === "" ? "/completions" : `/completions?${search}`;
}

function parseJson(text: string): unknown {
  if (text.trim() === "") return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Talks to the Rails API in api/. Keys travel as snake_case and come back camelCase. */
export class HttpApi implements ColmeiaApi {
  readonly mode = "http" as const;
  private readonly baseUrl: string;
  private inviteCode: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  setInviteCode(inviteCode: string | null): void {
    this.inviteCode = inviteCode;
  }

  /** Every scoped endpoint answers only for the colmeia named in the header. */
  private headers(hasBody: boolean): Record<string, string> {
    const headers: Record<string, string> = {};
    if (hasBody) headers["Content-Type"] = "application/json";
    if (this.inviteCode !== null) headers[HOUSEHOLD_HEADER] = this.inviteCode;
    return headers;
  }

  private async request<T>(method: Method, path: string, body?: unknown): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/api/v1${path}`, {
        method,
        headers: this.headers(body !== undefined),
        body: body === undefined ? undefined : JSON.stringify(toSnakeKeys(body)),
      });
    } catch {
      throw new ApiError(0, ["Não deu para falar com o servidor. Confira a conexão."]);
    }
    if (response.status === 204) return undefined as T;
    const json = parseJson(await response.text());
    if (!response.ok) {
      const { details, error } = (json ?? {}) as ErrorBody;
      const fallback = error ? (ERROR_LABELS[error] ?? error) : `O servidor respondeu com erro ${response.status}. Tente de novo em instantes.`;
      throw new ApiError(response.status, details ?? [fallback]);
    }
    return toCamelKeys<T>(json);
  }

  households = {
    create: (input: HouseholdInput): Promise<HouseholdWithMembers> => this.request("POST", "/households", { household: input }),
    createDemo: (): Promise<DemoColmeia> => this.request("POST", "/households/demo"),
    lookup: (inviteCode: string): Promise<HouseholdWithMembers> => this.request("GET", `/households/${encodeURIComponent(inviteCode)}`),
    claim: (inviteCode: string, memberId: number): Promise<Member> =>
      this.request("POST", `/households/${encodeURIComponent(inviteCode)}/claim`, { memberId }),
    join: (inviteCode: string, input: MemberInput): Promise<Member> =>
      this.request("POST", `/households/${encodeURIComponent(inviteCode)}/join`, { member: input }),
  };

  household = {
    get: (): Promise<Household> => this.request("GET", "/household"),
    update: (input: Pick<Household, "name">): Promise<Household> => this.request("PATCH", "/household", { household: input }),
    reseed: (): Promise<Member> => this.request("POST", "/household/reseed"),
  };

  members = {
    list: (): Promise<Member[]> => this.request("GET", "/members"),
    create: (input: MemberInput): Promise<Member> => this.request("POST", "/members", { member: input }),
    update: (id: number, input: Partial<MemberInput>): Promise<Member> => this.request("PATCH", `/members/${id}`, { member: input }),
    remove: (id: number): Promise<void> => this.request("DELETE", `/members/${id}`),
  };

  seasons = {
    list: (): Promise<Season[]> => this.request("GET", "/seasons"),
    create: (input: SeasonInput): Promise<Season> => this.request("POST", "/seasons", { season: input }),
    update: (id: number, input: Partial<SeasonUpdate>): Promise<Season> => this.request("PATCH", `/seasons/${id}`, { season: input }),
    close: (id: number): Promise<Season> => this.request("POST", `/seasons/${id}/close`),
    reopen: (id: number): Promise<Season> => this.request("POST", `/seasons/${id}/reopen`),
    remove: (id: number): Promise<void> => this.request("DELETE", `/seasons/${id}`),
  };

  tasks = {
    list: (seasonId: number | null): Promise<Task[]> => this.request("GET", scopedPath("/tasks", seasonId)),
    create: (input: TaskInput): Promise<Task> => this.request("POST", "/tasks", { task: input }),
    update: (id: number, input: Partial<TaskInput>): Promise<Task> => this.request("PATCH", `/tasks/${id}`, { task: input }),
    remove: (id: number): Promise<void> => this.request("DELETE", `/tasks/${id}`),
    complete: (id: number, memberId: number, options: CompleteTaskOptions = {}): Promise<CompleteTaskResult> =>
      this.request("POST", `/tasks/${id}/complete`, { memberId, completedAt: options.completedAt }),
    reopen: (id: number): Promise<Task> => this.request("POST", `/tasks/${id}/reopen`),
  };

  completions = {
    list: (options: CompletionQuery = {}): Promise<Completion[]> =>
      this.request("GET", completionsPath(options)),
    review: (id: number, input: ReviewInput): Promise<Completion> => this.request("POST", `/completions/${id}/review`, input),
  };

  achievementAwards = {
    list: (memberId: number | null): Promise<AchievementAward[]> =>
      this.request("GET", memberId === null ? "/achievement_awards" : `/achievement_awards?member_id=${memberId}`),
    record: (memberId: number, awards: AchievementAwardInput[]): Promise<AchievementAward[]> =>
      this.request("POST", "/achievement_awards", { memberId, awards }),
  };

  shopping = {
    list: (): Promise<ShoppingItem[]> => this.request("GET", "/shopping_items"),
    create: (input: ShoppingItemInput): Promise<ShoppingItem> => this.request("POST", "/shopping_items", { shoppingItem: input }),
    update: (id: number, input: ShoppingItemUpdate): Promise<ShoppingItem> =>
      this.request("PATCH", `/shopping_items/${id}`, { shoppingItem: input }),
    remove: (id: number): Promise<void> => this.request("DELETE", `/shopping_items/${id}`),
    clearPurchased: (): Promise<void> => this.request("DELETE", "/shopping_items/purchased"),
  };

  goals = {
    list: (seasonId: number | null): Promise<Goal[]> => this.request("GET", scopedPath("/goals", seasonId)),
    create: (input: GoalInput): Promise<Goal> => this.request("POST", "/goals", { goal: input }),
    update: (id: number, input: Partial<GoalInput>): Promise<Goal> => this.request("PATCH", `/goals/${id}`, { goal: input }),
    remove: (id: number): Promise<void> => this.request("DELETE", `/goals/${id}`),
  };
}
