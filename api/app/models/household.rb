class Household < ApplicationRecord
  DEFAULT_NAME = "Nossa casa".freeze

  validates :name, presence: true, length: { maximum: 60 }

  def self.current
    first || create!(name: DEFAULT_NAME)
  end
end
