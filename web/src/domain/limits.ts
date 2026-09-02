/** Same ceilings as the Rails validations, so the demo store rejects what the API would reject. */
export const LIMITS = {
  taskTitle: 120,
  taskPoints: 1000,
  goalTitle: 80,
  goalTarget: 100_000,
  memberName: 40,
  crownTitle: 30,
  shoppingItemName: 80,
  shoppingQuantity: 30,
  householdName: 60,
  /** How many people a colmeia starts with, and how many it ever holds. The
   *  invite link is public, so both have a ceiling. */
  initialMembers: 20,
  householdMembers: 30,
} as const;
