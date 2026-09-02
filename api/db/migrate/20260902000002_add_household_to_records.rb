class AddHouseholdToRecords < ActiveRecord::Migration[8.1]
  TABLES = %i[ members tasks completions shopping_items goals ].freeze
  FALLBACK_NAME = "Nossa casa".freeze

  class MigrationHousehold < ActiveRecord::Base
    self.table_name = "households"
  end

  def up
    TABLES.each { |table| add_reference table, :household, foreign_key: true, index: true }

    backfill!

    TABLES.each { |table| change_column_null table, :household_id, false }
  end

  def down
    TABLES.each { |table| remove_reference table, :household, foreign_key: true }
  end

  private

  # Everything written before colmeias existed belongs to the one household the
  # app used to assume.
  def backfill!
    return if TABLES.none? { |table| orphans?(table) }

    household_id = MigrationHousehold.order(:id).pick(:id) || create_fallback_household
    TABLES.each do |table|
      execute("UPDATE #{table} SET household_id = #{household_id.to_i} WHERE household_id IS NULL")
    end
  end

  def orphans?(table)
    select_value("SELECT COUNT(*) FROM #{table} WHERE household_id IS NULL").to_i.positive?
  end

  def create_fallback_household
    MigrationHousehold.reset_column_information
    MigrationHousehold.create!(name: FALLBACK_NAME, invite_code: SecureRandom.alphanumeric(10)).id
  end
end
