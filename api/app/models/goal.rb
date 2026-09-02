# A reward some people are working towards, inside one estação. Nobody named
# means the whole colmeia; anyone named means only their approved points count.
# The goal runs for the whole estação unless it carries days of its own.
class Goal < ApplicationRecord
  MAX_TARGET = 100_000

  include HouseholdScoped

  belongs_to_in_household :season
  has_many :goal_members, dependent: :destroy
  has_many :members, through: :goal_members

  validates :title, presence: true, length: { maximum: 80 }
  validates :target_points, numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: MAX_TARGET }
  validate :participants_live_here
  validate :window_fits_the_season

  after_save :store_participants

  scope :for_household, -> { where.missing(:goal_members) }
  scope :with_participants, -> { where.associated(:goal_members).distinct }
  scope :oldest_first, -> { order(:created_at) }

  # Who the goal is for, sorted. The list assigned here is written only after the
  # goal itself is valid, so a participant from nowhere answers 422 like any
  # other broken rule instead of blowing up mid-insert.
  def member_ids
    @member_ids || goal_members.map(&:member_id).sort
  end

  def member_ids=(ids)
    @member_ids = Array(ids).reject { |id| id.to_s.strip.empty? }.map(&:to_i).uniq.sort
  end

  def for_household?
    member_ids.empty?
  end

  # The first and last day the goal counts, falling back to the estação's own.
  def window_starts_on
    starts_on || season&.starts_on
  end

  def window_ends_on
    ends_on || season&.ends_on
  end

  private

  def participants_live_here
    return if household.nil? || member_ids.empty?

    errors.add(:base, :unknown_member) if household.members.where(id: member_ids).count != member_ids.size
  end

  def window_fits_the_season
    errors.add(:base, :ends_before_starts) if starts_on.present? && ends_on.present? && ends_on < starts_on
    return if season.nil?

    errors.add(:base, :outside_season) unless [ starts_on, ends_on ].compact.all? { |day| season.contains?(day) }
  end

  def store_participants
    return if @member_ids.nil?

    wanted = @member_ids
    goal_members.where.not(member_id: wanted).destroy_all
    (wanted - goal_members.reload.map(&:member_id)).each do |id|
      goal_members.create!(household_id: household_id, member_id: id)
    end
    @member_ids = nil
    goal_members.reload
  end
end
