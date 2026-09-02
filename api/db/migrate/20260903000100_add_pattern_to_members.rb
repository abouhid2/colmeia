class AddPatternToMembers < ActiveRecord::Migration[8.1]
  def change
    add_column :members, :pattern, :string, null: false, default: "solid"
  end
end
