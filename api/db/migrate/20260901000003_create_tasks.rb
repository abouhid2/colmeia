class CreateTasks < ActiveRecord::Migration[8.1]
  def change
    create_table :tasks do |t|
      t.string :title, null: false
      t.text :description
      t.integer :points, null: false, default: 10
      t.string :priority, null: false, default: "medium"
      t.string :recurrence, null: false, default: "none"
      t.integer :interval_days
      t.date :due_on
      t.boolean :requires_review, null: false, default: false
      t.string :status, null: false, default: "open"
      t.datetime :completed_at
      t.references :assignee, foreign_key: { to_table: :members }, null: true
      t.references :created_by, foreign_key: { to_table: :members }, null: true

      t.timestamps
    end

    add_index :tasks, :status
    add_index :tasks, :due_on
  end
end
