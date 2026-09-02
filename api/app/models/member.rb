class Member < ApplicationRecord
  COLORS = %w[ honey pollen leaf berry sky plum ].freeze
  AVATARS = %w[ 🐝 🦊 🐻 🐼 🦉 🐸 🐙 🦁 🐨 🦄 🐧 🐢 ].freeze
  MAX_PER_HOUSEHOLD = 30

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

  validates :name, presence: true, length: { maximum: 40 }
  validates :avatar, presence: true, length: { maximum: 8 }
  validates :color, inclusion: { in: COLORS }
  validate :household_has_room, on: :create

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

  private

  # A house holds a family, not a mailing list: the invite link is public, so
  # something has to say when the list is full.
  def household_has_room
    return if household.nil? || household.members.count < MAX_PER_HOUSEHOLD

    errors.add(:base, "Esta colmeia já tem #{MAX_PER_HOUSEHOLD} pessoas")
  end
end
