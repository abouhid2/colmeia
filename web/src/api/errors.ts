export class ApiError extends Error {
  readonly status: number;
  readonly details: string[];

  constructor(status: number, details: string[]) {
    super(details[0] ?? "Não deu certo. Tente de novo.");
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.details.join(". ");
  if (error instanceof Error) return error.message;
  return "Não deu certo. Tente de novo.";
}
