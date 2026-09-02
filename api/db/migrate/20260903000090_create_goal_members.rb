class CreateGoalMembers < ActiveRecord::Migration[8.1]
  # Who a goal is for. No row at all means the whole colmeia works towards it.
  def change
    create_table :goal_members do |t|
      t.references :household, null: false, foreign_key: true, index: true
      t.references :goal, null: false, foreign_key: true, index: false
      t.references :member, null: false, foreign_key: true, index: true
      t.timestamps
    end

    add_index :goal_members, [ :goal_id, :member_id ], unique: true
  end
end
