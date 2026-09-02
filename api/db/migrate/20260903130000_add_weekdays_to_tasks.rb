class AddWeekdaysToTasks < ActiveRecord::Migration[8.1]
  def change
    add_column :tasks, :weekdays, :json, default: [], null: false
  end
end
