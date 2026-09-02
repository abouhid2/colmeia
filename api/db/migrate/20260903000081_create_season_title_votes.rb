class CreateSeasonTitleVotes < ActiveRecord::Migration[8.1]
  def change
    create_table :season_title_votes do |t|
      t.references :household, null: false, foreign_key: true
      t.references :season, null: false, foreign_key: true
      t.references :season_title, null: false, foreign_key: true
      t.references :voter, null: false, foreign_key: { to_table: :members }
      t.references :votee, null: false, foreign_key: { to_table: :members }
      t.timestamps
    end
    # One vote per person per title in an estação: voting again changes it.
    add_index :season_title_votes, %i[ season_id season_title_id voter_id ], unique: true,
      name: "index_season_title_votes_on_season_title_and_voter"
  end
end
