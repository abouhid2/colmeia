import type {
  Completion, Goal, GoalInput, Household, HouseholdInput, HouseholdWithMembers, Member, MemberInput,
  ReviewInput, ShoppingItem, ShoppingItemInput, ShoppingItemUpdate, Task, TaskInput,
} from "../domain/types";
import type { ColmeiaApi, CompleteTaskResult } from "./client";
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
  unauthorized: "Sem acesso a esta colmeia.",
  conflict: "Alguém mexeu nisso antes de você.",
  invalid: "Dados inválidos.",
  bad_request: "Pedido inválido.",
};

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
      const fallback = error ? (ERROR_LABELS[error] ?? error) : `O servidor respondeu com erro ${response.status}`;
      throw new ApiError(response.status, details ?? [fallback]);
    }
    return toCamelKeys<T>(json);
  }

  households = {
    create: (input: HouseholdInput): Promise<HouseholdWithMembers> => this.request("POST", "/households", { household: input }),
    lookup: (inviteCode: string): Promise<HouseholdWithMembers> => this.request("GET", `/households/${encodeURIComponent(inviteCode)}`),
    claim: (inviteCode: string, memberId: number): Promise<Member> =>
      this.request("POST", `/households/${encodeURIComponent(inviteCode)}/claim`, { memberId }),
    join: (inviteCode: string, input: MemberInput): Promise<Member> =>
      this.request("POST", `/households/${encodeURIComponent(inviteCode)}/join`, { member: input }),
  };

  household = {
    get: (): Promise<Household> => this.request("GET", "/household"),
    update: (input: Pick<Household, "name">): Promise<Household> => this.request("PATCH", "/household", { household: input }),
  };

  members = {
    list: (): Promise<Member[]> => this.request("GET", "/members"),
    create: (input: MemberInput): Promise<Member> => this.request("POST", "/members", { member: input }),
    update: (id: number, input: Partial<MemberInput>): Promise<Member> => this.request("PATCH", `/members/${id}`, { member: input }),
    remove: (id: number): Promise<void> => this.request("DELETE", `/members/${id}`),
  };

  tasks = {
    list: (): Promise<Task[]> => this.request("GET", "/tasks"),
    create: (input: TaskInput): Promise<Task> => this.request("POST", "/tasks", { task: input }),
    update: (id: number, input: Partial<TaskInput>): Promise<Task> => this.request("PATCH", `/tasks/${id}`, { task: input }),
    remove: (id: number): Promise<void> => this.request("DELETE", `/tasks/${id}`),
    complete: (id: number, memberId: number): Promise<CompleteTaskResult> =>
      this.request("POST", `/tasks/${id}/complete`, { memberId }),
    reopen: (id: number): Promise<Task> => this.request("POST", `/tasks/${id}/reopen`),
  };

  completions = {
    list: (limit?: number): Promise<Completion[]> =>
      this.request("GET", limit === undefined ? "/completions" : `/completions?limit=${limit}`),
    review: (id: number, input: ReviewInput): Promise<Completion> => this.request("POST", `/completions/${id}/review`, input),
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
    list: (): Promise<Goal[]> => this.request("GET", "/goals"),
    create: (input: GoalInput): Promise<Goal> => this.request("POST", "/goals", { goal: input }),
    update: (id: number, input: Partial<GoalInput>): Promise<Goal> => this.request("PATCH", `/goals/${id}`, { goal: input }),
    remove: (id: number): Promise<void> => this.request("DELETE", `/goals/${id}`),
  };
}
