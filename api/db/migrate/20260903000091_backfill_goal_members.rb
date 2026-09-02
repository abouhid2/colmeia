class BackfillGoalMembers < ActiveRecord::Migration[8.1]
  class MigrationGoal < ActiveRecord::Base
    self.table_name = "goals"
  end

  class MigrationGoalMember < ActiveRecord::Base
    self.table_name = "goal_members"
  end

  # A goal that belonged to one person becomes a goal with that one participant.
  def up
    reset!
    MigrationGoal.where.not(member_id: nil).order(:id).each do |goal|
      next if MigrationGoalMember.exists?(goal_id: goal.id, member_id: goal.member_id)

      MigrationGoalMember.create!(
        household_id: goal.household_id, goal_id: goal.id, member_id: goal.member_id,
        created_at: Time.current, updated_at: Time.current
      )
    end
  end

  def down
    reset!
    MigrationGoalMember.delete_all
  end

  private

  def reset!
    [ MigrationGoal, MigrationGoalMember ].each(&:reset_column_information)
  end
end
