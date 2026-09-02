module AchievementAwards
  # Writing badges down is idempotent: the app sends everything it derived and
  # only what is missing gets a row. Sending the same batch twice changes
  # nothing, which is what lets the sync run on every screen.
  class Record
    def initialize(household:, member:, rows: [])
      @household = household
      @member = member
      @rows = Array(rows).map { |row| row.to_h.symbolize_keys }
    end

    def call
      missing.filter_map do |row|
        household.achievement_awards.create!(row.merge(member: member))
      rescue ActiveRecord::RecordNotUnique
        # Another tab wrote the same badge first: nothing left to do.
        nil
      end
    end

    private

    attr_reader :household, :member, :rows

    def missing
      stored = household.achievement_awards.where(member_id: member.id).pluck(:key, :completion_id)
      rows
        .uniq { |row| slot(row) }
        .reject { |row| stored.include?(slot(row)) }
    end

    def slot(row)
      [ row[:key], row[:completion_id].presence&.to_i ]
    end
  end
end
