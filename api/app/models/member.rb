class Member < ApplicationRecord
  COLORS = %w[ honey pollen leaf berry sky plum ].freeze
  # How somebody's share of the honeycomb is drawn, so a colour-blind eye and
  # a printed page can still tell who filled which cell.
  PATTERNS = %w[ solid dots stripes crosses checks waves rings ].freeze
  AVATARS = %w[ 🐝 🦊 🐻 🐼 🦉 🐸 🐙 🦁 🐨 🦄 🐧 🐢 ].freeze
  KINDS = %w[ bee lagartinha ].freeze
  MAX_PER_HOUSEHOLD = 30
  MIN_MULTIPLIER = 0.5
  MAX_MULTIPLIER = 3.0
  # What a lagartinha earns until the family says otherwise.
  DEFAULT_LAGARTINHA_MULTIPLIER = 1.5
  # What someone wants to be called when they win the reward period.
  # Blank is a deliberate choice: that person never wears the crown.
  CROWN_TITLE_LIMIT = 30
  # How many badges someone can pin on their own profile.
  MAX_FAVORITE_ACHIEVEMENTS = 3

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
  has_many :goal_members, dependent: :destroy
  has_many :goals, through: :goal_members
  # Whoever leaves the colmeia takes their badges and their votes with them.
  has_many :achievement_awards, dependent: :destroy
  has_many :votes_cast, class_name: "SeasonTitleVote", foreign_key: :voter_id,
    dependent: :destroy, inverse_of: :voter
  has_many :votes_received, class_name: "SeasonTitleVote", foreign_key: :votee_id,
    dependent: :destroy, inverse_of: :votee

  # Prepended so it runs while the goal_members rows still point at the goals.
  before_destroy :drop_goals_nobody_else_is_in, prepend: true

  normalizes :crown_title, with: ->(title) { title.to_s.strip }, apply_to_nil: true
  normalizes :favorite_achievements, with: ->(keys) { Array(keys).map(&:to_s) }, apply_to_nil: true
  normalizes :nav_preferences, with: ->(value) { NavPreferences.normalize(value) }, apply_to_nil: true

  validates :name, presence: true, length: { maximum: 40 }
  validates :avatar, presence: true, length: { maximum: 8 }
  validates :color, inclusion: { in: COLORS }
  validates :pattern, inclusion: { in: PATTERNS }
  validates :kind, inclusion: { in: KINDS }
  validates :points_multiplier,
    numericality: { greater_than_or_equal_to: MIN_MULTIPLIER, less_than_or_equal_to: MAX_MULTIPLIER }
  validates :crown_title, length: { maximum: CROWN_TITLE_LIMIT }, allow_blank: true
  validate :favorite_achievements_are_pinnable
  validate :household_has_room, on: :create

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

  # A goal this person was the only one in is theirs, and leaves with them. One
  # they shared stays for whoever is left, never turning into a colmeia goal.
  def drop_goals_nobody_else_is_in
    goals.includes(:goal_members).select { |goal| goal.goal_members.size == 1 }.each(&:destroy)
  end

  # Three badges, all real, no repeats: the shelf on the profile has three slots.
  def favorite_achievements_are_pinnable
    keys = favorite_achievements
    errors.add(:favorite_achievements, :too_many, count: MAX_FAVORITE_ACHIEVEMENTS) if keys.size > MAX_FAVORITE_ACHIEVEMENTS
    errors.add(:favorite_achievements, :unknown) if (keys - AchievementAward::KEYS).any?
    errors.add(:favorite_achievements, :duplicated) if keys.uniq.size != keys.size
  end

  # A house holds a family, not a mailing list: the invite link is public, so
  # something has to say when the list is full.
  def household_has_room
    return if household.nil? || household.members.count < MAX_PER_HOUSEHOLD

    errors.add(:base, "Esta colmeia já tem #{MAX_PER_HOUSEHOLD} pessoas")
  end

  # Becoming a lagartinha suggests the default handicap, once. Going back to
  # bee leaves whatever the family set: an adult may want one too.
  def apply_lagartinha_multiplier
    return unless kind_changed?(to: "lagartinha")
    return unless points_multiplier == 1

    self.points_multiplier = DEFAULT_LAGARTINHA_MULTIPLIER
  end
end
