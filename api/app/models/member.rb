class Member < ApplicationRecord
  COLORS = %w[ honey pollen leaf berry sky plum ].freeze

  has_many :assigned_tasks, class_name: "Task", foreign_key: :assignee_id,
    dependent: :nullify, inverse_of: :assignee
  has_many :created_tasks, class_name: "Task", foreign_key: :created_by_id,
    dependent: :nullify, inverse_of: :created_by
  has_many :completions, dependent: :nullify
  has_many :reviews, class_name: "Completion", foreign_key: :reviewer_id,
    dependent: :nullify, inverse_of: :reviewer
  has_many :shopping_items, foreign_key: :added_by_id, dependent: :nullify, inverse_of: :added_by
  has_many :purchases, class_name: "ShoppingItem", foreign_key: :purchased_by_id,
    dependent: :nullify, inverse_of: :purchased_by
  has_many :goals, dependent: :destroy

  validates :name, presence: true, length: { maximum: 40 }
  validates :avatar, presence: true, length: { maximum: 8 }
  validates :color, inclusion: { in: COLORS }
end
