class AddFavoriteAchievementsToMembers < ActiveRecord::Migration[8.1]
  def change
    add_column :members, :favorite_achievements, :json, null: false, default: []
  end
end
