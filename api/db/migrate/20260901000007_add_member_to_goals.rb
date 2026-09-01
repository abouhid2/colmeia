class AddMemberToGoals < ActiveRecord::Migration[8.1]
  def change
    add_reference :goals, :member, foreign_key: true, null: true
  end
end
