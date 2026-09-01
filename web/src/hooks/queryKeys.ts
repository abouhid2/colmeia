export const queryKeys = {
  household: ["household"],
  members: ["members"],
  tasks: ["tasks"],
  completions: ["completions"],
  shopping: ["shopping"],
  goals: ["goals"],
} as const;

export type QueryKey = (typeof queryKeys)[keyof typeof queryKeys];
