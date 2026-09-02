export const queryKeys = {
  household: ["household"],
  members: ["members"],
  tasks: ["tasks"],
  completions: ["completions"],
  awards: ["awards"],
  shopping: ["shopping"],
  goals: ["goals"],
  storedHouseholds: ["stored-households"],
} as const;

export type QueryKey = (typeof queryKeys)[keyof typeof queryKeys];
