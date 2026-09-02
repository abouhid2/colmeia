class Member < ApplicationRecord
  COLORS = %w[ honey pollen leaf berry sky plum ].freeze
  AVATARS = %w[ 🐝 🦊 🐻 🐼 🦉 🐸 🐙 🦁 🐨 🦄 🐧 🐢 ].freeze
  # What someone wants to be called when they win the reward period.
  # Blank is a deliberate choice: that person never wears the crown.
  CROWN_TITLE_LIMIT = 30

  belongs_to :household
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

  normalizes :crown_title, with: ->(title) { title.to_s.strip }, apply_to_nil: true

  validates :name, presence: true, length: { maximum: 40 }
  validates :avatar, presence: true, length: { maximum: 8 }
  validates :color, inclusion: { in: COLORS }
  validates :crown_title, length: { maximum: CROWN_TITLE_LIMIT }, allow_blank: true

  scope :unclaimed, -> { where(claimed_at: nil) }

  # A member starts as a placeholder ("espantalho"): a name on the list nobody
  # sits behind yet. Claiming through the invite link is what turns it into a
  # person using the app.
  def claimed?
    claimed_at.present?
  end

  def claim!(now = Time.current)
    update!(claimed_at: now)
  end
end
