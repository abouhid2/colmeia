class BackfillSeasonTitles < ActiveRecord::Migration[8.1]
  # The list every colmeia opens with, written down here so the backfill keeps
  # meaning what it meant the day it ran.
  DEFAULTS = [
    { name: "Vencedor da estação", emoji: "👑", kind: "auto",
      description: "Quem mais pontuou com a meta da colmeia batida. Cada pessoa escolhe como quer ser chamada ao vencer." },
    { name: "Pernilongo", emoji: "🦟", kind: "vote", description: "Só perturbou e não fez nada." },
    { name: "Abelhudo", emoji: "🔍", kind: "vote", description: "Ficou fiscalizando demais o serviço dos outros." },
    { name: "Mosca-morta", emoji: "🪰", kind: "vote", description: "Nem precisa explicar." },
    { name: "Lesma", emoji: "🐌", kind: "vote", description: "O mais lerdo da estação." },
    { name: "Cigarra", emoji: "🦗", kind: "vote", description: "Só fica gritando e não faz nada." }
  ].freeze

  class MigrationHousehold < ActiveRecord::Base
    self.table_name = "households"
  end

  class MigrationSeasonTitle < ActiveRecord::Base
    self.table_name = "season_titles"
  end

  # Colmeias that existed before títulos get the same list a new one opens with.
  def up
    [ MigrationHousehold, MigrationSeasonTitle ].each(&:reset_column_information)
    MigrationHousehold.order(:id).each { |household| fill(household.id) }
  end

  def down
    MigrationSeasonTitle.delete_all
  end

  private

  def fill(household_id)
    return if MigrationSeasonTitle.exists?(household_id: household_id)

    now = Time.current
    DEFAULTS.each_with_index do |attributes, position|
      MigrationSeasonTitle.create!(attributes.merge(household_id: household_id, position: position, active: true, created_at: now, updated_at: now))
    end
  end
end
