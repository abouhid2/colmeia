module SeasonTitles
  # Every colmeia opens with the same list of títulos, so the first estação to
  # close already has something to hand out and something to vote on.
  class Seed
    def initialize(household)
      @household = household
    end

    def call
      return household.season_titles.in_order.to_a if household.season_titles.exists?

      SeasonTitle::DEFAULTS.each_with_index.map do |attributes, position|
        household.season_titles.create!(attributes.merge(position: position))
      end
    end

    private

    attr_reader :household
  end
end
