class Member < ApplicationRecord
  COLORS = %w[ honey pollen leaf berry sky plum ].freeze
  AVATARS = %w[ 🐝 🦊 🐻 🐼 🦉 🐸 🐙 🦁 🐨 🦄 🐧 🐢 ].freeze
  KINDS = %w[ bee lagartinha ].freeze
  MIN_MULTIPLIER = 0.5
  MAX_MULTIPLIER = 3.0
  # What a lagartinha earns until the family says otherwise.
  DEFAULT_LAGARTINHA_MULTIPLIER = 1.5
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
  validates :kind, inclusion: { in: KINDS }
  validates :points_multiplier,
    numericality: { greater_than_or_equal_to: MIN_MULTIPLIER, less_than_or_equal_to: MAX_MULTIPLIER }
  validates :crown_title, length: { maximum: CROWN_TITLE_LIMIT }, allow_blank: true

  before_save :apply_lagartinha_multiplier

  scope :unclaimed, -> { where(claimed_at: nil) }
  scope :lagartinhas, -> { where(kind: "lagartinha") }

  # A member starts as a placeholder ("espantalho"): a name on the list nobody
  # sits behind yet. Claiming through the invite link is what turns it into a
  # person using the app.
  def claimed?
    claimed_at.present?
  end

  def claim!(now = Time.current)
    update!(claimed_at: now)
  end

  def lagartinha?
    kind == "lagartinha"
  end

  # Scales points so a child moves the shared honeycomb. Kept as an integer:
  # nobody wants half a point.
  def award(base_points)
    (base_points * points_multiplier).round
  end

  private

  # Becoming a lagartinha suggests the default handicap, once. Going back to
  # bee leaves whatever the family set: an adult may want one too.
  def apply_lagartinha_multiplier
    return unless kind_changed?(to: "lagartinha")
    return unless points_multiplier == 1

    self.points_multiplier = DEFAULT_LAGARTINHA_MULTIPLIER
  end
end
