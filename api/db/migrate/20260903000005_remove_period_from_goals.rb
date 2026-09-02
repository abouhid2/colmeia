class RemovePeriodFromGoals < ActiveRecord::Migration[8.1]
  # A goal's window is its season now, so the weekly/monthly period is gone.
  def change
    remove_column :goals, :period, :string, null: false, default: "week"
  end
end
