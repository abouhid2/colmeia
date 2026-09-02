class Task < ApplicationRecord
  PRIORITIES = %w[ low medium high urgent ].freeze
  RECURRENCES = %w[ none daily weekly monthly custom ].freeze
  STATUSES = %w[ open done ].freeze
  MAX_POINTS = 1000

  include HouseholdScoped

  belongs_to_in_household :season
  belongs_to_in_household :assignee, class_name: "Member", optional: true
  belongs_to_in_household :created_by, class_name: "Member", optional: true
  has_many :completions, dependent: :nullify

  validates :title, presence: true, length: { maximum: 120 }
  validates :points, numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: MAX_POINTS }
  validates :priority, inclusion: { in: PRIORITIES }
  validates :recurrence, inclusion: { in: RECURRENCES }
  validates :status, inclusion: { in: STATUSES }
  validates :interval_days, numericality: { only_integer: true, greater_than: 0 }, if: :custom?

  before_save :clear_completed_at_when_reopened

  scope :active, -> { where(status: "open") }
  scope :done, -> { where(status: "done") }

  def recurring?
    recurrence != "none"
  end

  def custom?
    recurrence == "custom"
  end

  def done?
    status == "done"
  end

  # Next due date after a completion. Recurrence counts from the completion
  # day, not from the previous due date: a bathroom cleaned two days late is
  # still clean for a full week.
  def next_due_on(from = Date.current)
    case recurrence
    when "daily" then from + 1
    when "weekly" then from + 7
    when "monthly" then from >> 1
    when "custom" then from + interval_days
    end
  end

  private

  def clear_completed_at_when_reopened
    self.completed_at = nil unless done?
  end
end
