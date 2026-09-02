class AddDemoToHouseholds < ActiveRecord::Migration[8.1]
  def change
    # A sandbox colmeia: one per visitor who wants to poke at the app before
    # starting a real colmeia. Nothing in it is anybody's data, so it can be
    # restarted at will and swept once it goes cold.
    add_column :households, :demo, :boolean, null: false, default: false
    add_index :households, :demo
  end
end
