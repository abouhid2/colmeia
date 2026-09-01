export const queryKeys = {
  household: ["household"],
  members: ["members"],
  tasks: ["tasks"],
  completions: ["completions"],
  shopping: ["shopping"],
  goal: ["goal"],
} as const;

export type QueryKey = (typeof queryKeys)[keyof typeof queryKeys];
