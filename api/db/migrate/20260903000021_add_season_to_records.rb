class AddSeasonToRecords < ActiveRecord::Migration[8.1]
  TABLES = %i[ tasks goals completions ].freeze

  def change
    TABLES.each { |table| add_reference table, :season, foreign_key: true, index: true }
  end
end
