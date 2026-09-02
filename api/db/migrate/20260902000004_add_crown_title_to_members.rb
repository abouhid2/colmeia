class AddCrownTitleToMembers < ActiveRecord::Migration[8.1]
  def change
    add_column :members, :crown_title, :string, null: false, default: "Abelha Rainha"
  end
end
