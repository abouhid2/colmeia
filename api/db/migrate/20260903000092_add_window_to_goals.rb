class AddWindowToGoals < ActiveRecord::Migration[8.1]
  # The stretch of the estação a goal runs in. Both blank means the whole estação.
  def change
    add_column :goals, :starts_on, :date
    add_column :goals, :ends_on, :date
  end
end
