class Task < ApplicationRecord
  PRIORITIES = %w[ low medium high urgent ].freeze
  RECURRENCES = %w[ none daily weekly weekdays monthly custom ].freeze
  # 0 is Sunday, the way Date#wday counts.
  WEEKDAYS = (0..6).to_a.freeze
  STATUSES = %w[ open done ].freeze
  MAX_POINTS = 1000

  include HouseholdScoped

  belongs_to_in_household :season
  belongs_to_in_household :created_by, class_name: "Member", optional: true
  has_many :completions, dependent: :nullify
  has_many :task_members, dependent: :destroy
  has_many :assignees, through: :task_members, source: :member

  validates :title, presence: true, length: { maximum: 120 }
  validates :points, numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: MAX_POINTS }
  validates :priority, inclusion: { in: PRIORITIES }
  validates :recurrence, inclusion: { in: RECURRENCES }
  validates :status, inclusion: { in: STATUSES }
  validates :interval_days, numericality: { only_integer: true, greater_than: 0 }, if: :custom?
  validate :weekdays_are_days_of_the_week
  validate :assignees_live_here

  normalizes :weekdays, with: ->(days) { Array(days).map(&:to_i).uniq.sort }, apply_to_nil: true

  after_save :store_assignees

  before_validation :drop_weekdays_unless_used
  before_save :clear_completed_at_when_reopened

  scope :active, -> { where(status: "open") }
  scope :done, -> { where(status: "done") }

  def recurring?
    recurrence != "none"
  end

  def custom?
    recurrence == "custom"
  end

  # Repeats on chosen days of the week: the rubbish goes out on Tuesdays,
  # Thursdays and Saturdays, not every seven days from whenever it last went.
  def on_weekdays?
    recurrence == "weekdays"
  end

  def done?
    status == "done"
  end

  # Who the task is for, sorted. Like a goal's participants, the list assigned
  # here is written only after the task itself is valid, so somebody from
  # another colmeia answers 422 instead of blowing up mid-insert.
  def assignee_ids
    @assignee_ids || task_members.map(&:member_id).sort
  end

  def assignee_ids=(ids)
    @assignee_ids = Array(ids).reject { |id| id.to_s.strip.empty? }.map(&:to_i).uniq.sort
  end

  def shared?
    assignee_ids.size > 1
  end

  # Next due date after a completion. Recurrence counts from the completion
  # day, not from the previous due date: a bathroom cleaned two days late is
  # still clean for a full week.
  def next_due_on(from = Date.current)
    case recurrence
    when "daily" then from + 1
    when "weekly" then from + 7
    when "weekdays" then next_weekday_after(from)
    when "monthly" then from >> 1
    when "custom" then from + interval_days
    end
  end

  private

  # The first of the chosen days that comes after the day the work happened,
  # so a Tuesday task done on Tuesday comes back on the next chosen day.
  def next_weekday_after(from)
    return nil if weekdays.empty?

    (1..7).each do |step|
      day = from + step
      return day if weekdays.include?(day.wday)
    end
    nil
  end

  def assignees_live_here
    return if household.nil? || assignee_ids.empty?

    errors.add(:base, :unknown_assignee) if household.members.where(id: assignee_ids).count != assignee_ids.size
  end

  def store_assignees
    return if @assignee_ids.nil?

    wanted = @assignee_ids
    task_members.where.not(member_id: wanted).destroy_all
    (wanted - task_members.reload.map(&:member_id)).each do |id|
      task_members.create!(household_id: household_id, member_id: id)
    end
    @assignee_ids = nil
    task_members.reload
  end

  # Days only mean something for a task that repeats on them, so any other
  # recurrence forgets whatever days a previous one had.
  def drop_weekdays_unless_used
    self.weekdays = [] unless on_weekdays?
  end

  def weekdays_are_days_of_the_week
    return unless on_weekdays?

    errors.add(:weekdays, :blank) if weekdays.empty?
    errors.add(:weekdays, :unknown) if (weekdays - WEEKDAYS).any?
  end

  def clear_completed_at_when_reopened
    self.completed_at = nil unless done?
  end
end
