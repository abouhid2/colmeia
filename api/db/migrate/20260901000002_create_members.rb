class CreateMembers < ActiveRecord::Migration[8.1]
  def change
    create_table :members do |t|
      t.string :name, null: false
      t.string :avatar, null: false, default: "🐝"
      t.string :color, null: false, default: "honey"

      t.timestamps
    end
  end
end
