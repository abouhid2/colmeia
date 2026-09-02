# A reward the household (member_id nil) or one person (member_id set) is
# working towards. Progress is the approved points scored inside its estação.
class Goal < ApplicationRecord
  MAX_TARGET = 100_000

  include HouseholdScoped

  belongs_to_in_household :season
  belongs_to_in_household :member, optional: true

  validates :title, presence: true, length: { maximum: 80 }
  validates :target_points, numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: MAX_TARGET }

  scope :for_household, -> { where(member_id: nil) }
  scope :personal, -> { where.not(member_id: nil) }
  scope :oldest_first, -> { order(:created_at) }
end
