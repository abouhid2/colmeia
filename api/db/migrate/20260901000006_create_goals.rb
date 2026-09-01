class CreateGoals < ActiveRecord::Migration[8.1]
  def change
    create_table :goals do |t|
      t.string :title, null: false
      t.integer :target_points, null: false, default: 300
      t.string :period, null: false, default: "week"

      t.timestamps
    end
  end
end
