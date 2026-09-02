export const queryKeys = {
  household: ["household"],
  members: ["members"],
  seasons: ["seasons"],
  tasks: ["tasks"],
  completions: ["completions"],
  awards: ["awards"],
  shopping: ["shopping"],
  goals: ["goals"],
  seasonTitles: ["season-titles"],
  votes: ["votes"],
  storedHouseholds: ["stored-households"],
} as const;

export type QueryKey = (typeof queryKeys)[keyof typeof queryKeys];
