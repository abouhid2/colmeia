module Households
  # Someone starts a colmeia by naming it and listing who lives there. Everyone
  # on that list is a placeholder until they claim themselves through the link.
  # The colmeia opens with one estação, so there is somewhere to put a task.
  class Create
    FIRST_SEASON_NAME = "Primeira estação".freeze

    def initialize(name:, member_names: [])
      @name = name
      @member_names = Array(member_names).map { |value| value.to_s.strip }.reject(&:empty?)
    end

    def call
      Household.transaction do
        household = Household.create!(name: name)
        household.seasons.create!(name: FIRST_SEASON_NAME, starts_on: Date.current)
        member_names.each_with_index { |member_name, index| household.members.create!(placeholder(member_name, index)) }
        household
      end
    end

    private

    attr_reader :name, :member_names

    def placeholder(member_name, index)
      {
        name: member_name,
        avatar: Member::AVATARS[index % Member::AVATARS.size],
        color: Member::COLORS[index % Member::COLORS.size]
      }
    end
  end
end
