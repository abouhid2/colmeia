class CreateCompletions < ActiveRecord::Migration[8.1]
  def change
    create_table :completions do |t|
      t.references :task, foreign_key: true, null: true
      t.references :member, foreign_key: true, null: true
      t.references :reviewer, foreign_key: { to_table: :members }, null: true
      t.string :status, null: false, default: "approved"
      t.integer :rating
      t.integer :points_awarded, null: false, default: 0
      t.string :task_title, null: false
      t.integer :task_points, null: false
      t.datetime :completed_at, null: false
      t.datetime :reviewed_at

      t.timestamps
    end

    add_index :completions, :status
    add_index :completions, :completed_at
  end
end
