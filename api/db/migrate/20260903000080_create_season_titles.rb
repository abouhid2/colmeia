class CreateSeasonTitles < ActiveRecord::Migration[8.1]
  def change
    create_table :season_titles do |t|
      t.references :household, null: false, foreign_key: true
      t.string :name, null: false
      t.string :description, null: false, default: ""
      t.string :emoji, null: false
      t.string :kind, null: false, default: "vote"
      t.integer :position, null: false, default: 0
      t.boolean :active, null: false, default: true
      t.timestamps
    end
  end
end
