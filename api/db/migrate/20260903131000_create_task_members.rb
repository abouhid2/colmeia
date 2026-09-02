class CreateTaskMembers < ActiveRecord::Migration[8.1]
  # Who a task is for. No row at all means whoever gets to it first.
  def change
    create_table :task_members do |t|
      t.references :household, null: false, foreign_key: true, index: true
      t.references :task, null: false, foreign_key: true, index: false
      t.references :member, null: false, foreign_key: true, index: true
      t.timestamps
    end

    add_index :task_members, [ :task_id, :member_id ], unique: true
  end
end
