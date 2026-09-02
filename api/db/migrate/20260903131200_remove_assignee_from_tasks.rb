class RemoveAssigneeFromTasks < ActiveRecord::Migration[8.1]
  # Whoever a task is for lives in task_members now, however many of them there are.
  def change
    remove_reference :tasks, :assignee, foreign_key: { to_table: :members }, index: true
  end
end
