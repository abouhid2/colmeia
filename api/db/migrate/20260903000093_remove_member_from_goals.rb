class RemoveMemberFromGoals < ActiveRecord::Migration[8.1]
  # Participants live in goal_members now, however many of them there are.
  def change
    remove_reference :goals, :member, foreign_key: true, index: true
  end
end
