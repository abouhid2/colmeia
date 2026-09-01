import type {
  Completion, Goal, GoalInput, Household, Member, MemberInput, ReviewInput,
  ShoppingItem, ShoppingItemInput, ShoppingItemUpdate, Task, TaskInput,
} from "../domain/types";
import type { ColmeiaApi, CompleteTaskResult } from "./client";
import { ApiError } from "./errors";
import { toCamelKeys, toSnakeKeys } from "./keys";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ErrorBody {
  error?: string;
  details?: string[];
}

/** Talks to the Rails API in api/. Keys travel as snake_case and come back camelCase. */
export class HttpApi implements ColmeiaApi {
  readonly mode = "http" as const;
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  private async request<T>(method: Method, path: string, body?: unknown): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/api/v1${path}`, {
        method,
        headers: body === undefined ? undefined : { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(toSnakeKeys(body)),
      });
    } catch {
      throw new ApiError(0, ["Não deu para falar com o servidor. Confira a conexão."]);
    }
    if (response.status === 204) return undefined as T;
    const json: unknown = await response.json();
    if (!response.ok) {
      const { details, error } = (json ?? {}) as ErrorBody;
      throw new ApiError(response.status, details ?? [error ?? "Algo deu errado"]);
    }
    return toCamelKeys<T>(json);
  }

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
  };

  completions = {
    list: (): Promise<Completion[]> => this.request("GET", "/completions"),
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

  goal = {
    get: (): Promise<Goal | null> => this.request("GET", "/goal"),
    update: (input: GoalInput): Promise<Goal> => this.request("PUT", "/goal", { goal: input }),
  };
}
