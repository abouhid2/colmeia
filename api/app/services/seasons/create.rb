module Seasons
  # Opens an estação. Reusing another one's tasks is the common case: the same
  # chores come back every season, only the score starts from zero.
  class Create
    COPIED_ATTRIBUTES = %i[
      title description points priority recurrence interval_days
      requires_review assignee_id created_by_id
    ].freeze

    def initialize(household:, attributes:, copy_tasks_from_season_id: nil)
      @household = household
      @attributes = attributes
      @copy_tasks_from_season_id = copy_tasks_from_season_id
    end

    def call
      Season.transaction do
        season = household.seasons.create!(attributes)
        copy_tasks_into(season)
        season
      end
    end

    private

    attr_reader :household, :attributes, :copy_tasks_from_season_id

    def copy_tasks_into(season)
      return if copy_tasks_from_season_id.blank?

      source = household.seasons.find(copy_tasks_from_season_id)
      source.tasks.active.order(:created_at).each do |task|
        season.tasks.create!(task.slice(*COPIED_ATTRIBUTES).merge(household_id: household.id))
      end
    end
  end
end
