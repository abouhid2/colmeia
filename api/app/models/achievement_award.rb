# A badge someone earned, written down at the moment it happened. The web app
# derives badges from the completions, so they would disappear along with them:
# these rows are the history that stays.
class AchievementAward < ApplicationRecord
  # The same ids the web app uses, in the same spelling, because they travel
  # between the two sides untouched.
  KEYS = %w[
    firstTask tenTasks fiftyTasks hundredPoints fiveHundredPoints
    flawless fiveReviews urgentTask bigTask sevenDays
  ].freeze

  include HouseholdScoped

  belongs_to_in_household :member

  validates :key, inclusion: { in: KEYS }
  validates :key, uniqueness: { scope: %i[ member_id completion_id ] }
  validates :awarded_at, presence: true
  validate :completion_from_this_household

  scope :oldest_first, -> { order(:awarded_at, :id) }

  private

  # The completion may be long gone, and that is fine. What it may not be is
  # somebody else's colmeia.
  def completion_from_this_household
    return if completion_id.nil?

    completion = Completion.find_by(id: completion_id)
    return if completion.nil? || completion.household_id == household_id

    errors.add(:completion_id, "is from another colmeia")
  end
end
