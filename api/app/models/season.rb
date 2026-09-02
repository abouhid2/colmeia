# A championship the colmeia runs: its own tasks, goals, points and ranking.
# People and the shopping list stay with the colmeia; everything that scores
# belongs to one estação. An estação with no ends_on runs until someone closes it.
class Season < ApplicationRecord
  NAME_LIMIT = 40

  belongs_to :household
  has_many :tasks, dependent: :destroy
  has_many :goals, dependent: :destroy
  has_many :completions, dependent: :destroy

  validates :name, presence: true, length: { maximum: NAME_LIMIT }
  validates :starts_on, presence: true
  validate :ends_on_after_starts_on

  scope :newest_first, -> { order(starts_on: :desc, id: :desc) }
  scope :open_seasons, -> { where(closed_at: nil) }

  def closed?
    closed_at.present?
  end

  def active?
    !closed?
  end

  # Whether a day falls inside the estação, an open end included.
  def contains?(date)
    starts_on <= date && (ends_on.nil? || date <= ends_on)
  end

  private

  def ends_on_after_starts_on
    return if ends_on.nil? || starts_on.nil? || ends_on >= starts_on

    errors.add(:ends_on, :on_or_after_start)
  end
end
