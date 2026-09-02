class BackfillTaskMembers < ActiveRecord::Migration[8.1]
  class MigrationTask < ActiveRecord::Base
    self.table_name = "tasks"
  end

  class MigrationTaskMember < ActiveRecord::Base
    self.table_name = "task_members"
  end

  # A task that belonged to one person becomes a task with that one person on it.
  def up
    reset!
    MigrationTask.where.not(assignee_id: nil).order(:id).each do |task|
      next if MigrationTaskMember.exists?(task_id: task.id, member_id: task.assignee_id)

      MigrationTaskMember.create!(
        household_id: task.household_id, task_id: task.id, member_id: task.assignee_id,
        created_at: Time.current, updated_at: Time.current
      )
    end
  end

  def down
    reset!
    MigrationTaskMember.delete_all
  end

  private

  def reset!
    [ MigrationTask, MigrationTaskMember ].each(&:reset_column_information)
  end
end
