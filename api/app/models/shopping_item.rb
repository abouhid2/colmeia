class ShoppingItem < ApplicationRecord
  include HouseholdScoped

  belongs_to_in_household :added_by, class_name: "Member", optional: true
  belongs_to_in_household :purchased_by, class_name: "Member", optional: true

  validates :name, presence: true, length: { maximum: 80 }
  validates :quantity, length: { maximum: 30 }, allow_nil: true

  scope :to_buy, -> { where(purchased: false) }
  scope :purchased, -> { where(purchased: true) }
  scope :oldest_first, -> { order(:created_at) }
end
