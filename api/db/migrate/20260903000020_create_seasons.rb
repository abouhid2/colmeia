class CreateSeasons < ActiveRecord::Migration[8.1]
  def change
    create_table :seasons do |t|
      t.references :household, null: false, foreign_key: true, index: true
      t.string :name, null: false
      t.date :starts_on, null: false
      t.date :ends_on
      t.datetime :closed_at

      t.timestamps
    end
  end
end
