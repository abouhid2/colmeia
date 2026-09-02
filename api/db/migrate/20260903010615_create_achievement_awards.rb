class CreateAchievementAwards < ActiveRecord::Migration[8.1]
  def change
    create_table :achievement_awards do |t|
      t.references :household, null: false, foreign_key: true
      t.references :member, null: false, foreign_key: true, index: false
      t.string :key, null: false
      # No foreign key on purpose: a badge outlives the completion that earned
      # it, and the whole point of writing it down is surviving the delete.
      t.integer :completion_id
      t.datetime :awarded_at, null: false

      t.timestamps
    end

    add_index :achievement_awards, %i[ member_id key completion_id ], unique: true
  end
end
