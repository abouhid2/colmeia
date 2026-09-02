# One person a task is for. A task with nobody on it is for whoever gets to it
# first; a task with some is shared by exactly those people.
class TaskMember < ApplicationRecord
  include HouseholdScoped

  belongs_to_in_household :task
  belongs_to_in_household :member

  validates :member_id, uniqueness: { scope: :task_id }
end
