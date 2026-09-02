class Completion < ApplicationRecord
  STATUSES = %w[ pending approved ].freeze
  MAX_RATING = 5

  include HouseholdScoped

  belongs_to_in_household :season
  belongs_to_in_household :task, optional: true
  belongs_to_in_household :member, optional: true
  belongs_to_in_household :reviewer, class_name: "Member", optional: true

  validates :status, inclusion: { in: STATUSES }
  validates :rating, numericality: { only_integer: true, in: 1..MAX_RATING }, allow_nil: true
  validates :task_title, presence: true
  validates :task_points, :points_awarded,
    numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :multiplier,
    numericality: { greater_than_or_equal_to: Member::MIN_MULTIPLIER, less_than_or_equal_to: Member::MAX_MULTIPLIER }
  validates :completed_at, presence: true

  scope :pending, -> { where(status: "pending") }
  scope :approved, -> { where(status: "approved") }
  scope :recent_first, -> { order(completed_at: :desc) }

  # A 5-star job earns every point; a 1-star job earns a fifth of them.
  def self.points_for(task_points, rating)
    (task_points * rating / MAX_RATING.to_f).round
  end

  # The rating scales the task's own points, then the doer's multiplier applies.
  # In that order: a child is not punished twice for a low rating, and earns no
  # bonus on points she did not win.
  def points_for_rating(rating)
    (self.class.points_for(task_points, rating) * multiplier).round
  end

  def pending?
    status == "pending"
  end
end
