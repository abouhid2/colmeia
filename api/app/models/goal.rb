class Goal < ApplicationRecord
  PERIODS = %w[ week month ].freeze
  MAX_TARGET = 100_000

  validates :title, presence: true, length: { maximum: 80 }
  validates :target_points, numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: MAX_TARGET }
  validates :period, inclusion: { in: PERIODS }

  def self.current
    first
  end
end
