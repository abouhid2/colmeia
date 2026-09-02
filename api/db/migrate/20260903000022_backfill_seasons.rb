class BackfillSeasons < ActiveRecord::Migration[8.1]
  TABLES = %i[ tasks goals completions ].freeze
  FIRST_SEASON_NAME = "Primeira estação".freeze

  class MigrationHousehold < ActiveRecord::Base
    self.table_name = "households"
  end

  class MigrationSeason < ActiveRecord::Base
    self.table_name = "seasons"
  end

  class MigrationTask < ActiveRecord::Base
    self.table_name = "tasks"
  end

  class MigrationCompletion < ActiveRecord::Base
    self.table_name = "completions"
  end

  # Everything written before estações existed belongs to the first one, which
  # opens on the day the colmeia started doing things and never ends.
  def up
    reset!
    MigrationHousehold.order(:id).each { |household| adopt(household) }
    TABLES.each { |table| change_column_null table, :season_id, false }
  end

  def down
    TABLES.each { |table| change_column_null table, :season_id, true }
  end

  private

  def reset!
    [ MigrationHousehold, MigrationSeason, MigrationTask, MigrationCompletion ].each(&:reset_column_information)
  end

  def adopt(household)
    return if MigrationSeason.exists?(household_id: household.id)

    season = MigrationSeason.create!(
      household_id: household.id, name: FIRST_SEASON_NAME, starts_on: first_day_of(household.id),
      created_at: Time.current, updated_at: Time.current
    )
    TABLES.each do |table|
      execute("UPDATE #{table} SET season_id = #{season.id.to_i} WHERE household_id = #{household.id.to_i} AND season_id IS NULL")
    end
  end

  # The oldest thing the colmeia has, so no record lands before its own season.
  def first_day_of(household_id)
    oldest = [
      MigrationTask.where(household_id: household_id).minimum(:created_at),
      MigrationCompletion.where(household_id: household_id).minimum(:completed_at)
    ]
    oldest.compact.map { |moment| moment.in_time_zone.to_date }.push(Date.current).min
  end
end
