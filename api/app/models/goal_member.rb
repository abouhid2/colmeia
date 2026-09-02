# One person a goal is for. A goal with no participants belongs to the whole
# colmeia; a goal with some counts only what those people scored.
class GoalMember < ApplicationRecord
  include HouseholdScoped

  belongs_to_in_household :goal
  belongs_to_in_household :member

  validates :member_id, uniqueness: { scope: :goal_id }
end
