/** Same ceilings as the Rails validations, so the demo store rejects what the API would reject. */
export const LIMITS = {
  taskTitle: 120,
  taskPoints: 1000,
  goalTitle: 80,
  seasonName: 40,
  goalTarget: 100_000,
  memberName: 40,
  crownTitle: 30,
  shoppingItemName: 80,
  shoppingQuantity: 30,
  householdName: 60,
} as const;
