class CreateShoppingItems < ActiveRecord::Migration[8.1]
  def change
    create_table :shopping_items do |t|
      t.string :name, null: false
      t.string :quantity
      t.references :added_by, foreign_key: { to_table: :members }, null: true
      t.boolean :purchased, null: false, default: false
      t.references :purchased_by, foreign_key: { to_table: :members }, null: true
      t.datetime :purchased_at

      t.timestamps
    end

    add_index :shopping_items, :purchased
  end
end
