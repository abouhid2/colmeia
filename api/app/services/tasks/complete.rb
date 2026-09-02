module Tasks
  # Records that a member finished a task. One-off tasks close; recurring
  # tasks roll their due date forward. Tasks that require review create a
  # pending completion worth nothing until someone rates it.
  #
  # The work may have happened before anyone got around to registering it:
  # pass +completed_at+ and everything counts from that moment instead.
  class Complete
    class AlreadyDone < StandardError; end
    class InvalidMoment < StandardError; end

    # How far back a person may claim to have done something. Past a year the
    # entry is a typo more often than a memory.
    MAX_BACKDATE = 365.days
    # A phone's clock sits a minute or two ahead of the server's often enough
    # that "agora" would otherwise come back refused as the future.
    CLOCK_SKEW = 2.minutes

    Result = Struct.new(:task, :completion, keyword_init: true)

    def initialize(task:, member:, completed_at: nil, now: Time.current)
      @task = task
      @member = member
      @completed_at = completed_at
      @now = now
    end

    def call
      raise ActiveRecord::RecordNotFound if task.household_id != member.household_id
      raise AlreadyDone, "Essa tarefa já foi concluída" if task.done?

      moment = resolve_moment

      ActiveRecord::Base.transaction do
        completion = task.completions.create!(completion_attributes(moment))
        advance_task!(moment)
        Result.new(task: task, completion: completion)
      end
    end

    private

    attr_reader :task, :member, :now

    # A backdated completion is the person's own memory of when they did it:
    # taken at face value, but never in the future and never past a year back.
    def resolve_moment
      return now if @completed_at.blank?

      moment = parse_moment(@completed_at)
      raise InvalidMoment, "Não deu para entender essa data" if moment.nil?
      raise InvalidMoment, "Essa data está no futuro" if moment > now + CLOCK_SKEW
      raise InvalidMoment, "Só dá para registrar até um ano atrás" if moment < now - MAX_BACKDATE

      moment
    end

    def parse_moment(value)
      return value.in_time_zone if value.is_a?(Time) || value.is_a?(DateTime)

      Time.zone.parse(value.to_s)
    rescue ArgumentError
      nil
    end

    def completion_attributes(moment)
      {
        household_id: task.household_id,
        member: member,
        status: task.requires_review? ? "pending" : "approved",
        points_awarded: task.requires_review? ? 0 : member.award(task.points),
        multiplier: member.points_multiplier,
        task_title: task.title,
        task_points: task.points,
        completed_at: moment
      }
    end

    def advance_task!(moment)
      if task.recurring?
        task.update!(due_on: rolled_due_on(moment))
      else
        task.update!(status: "done", completed_at: moment)
      end
    end

    # The cycle counts from the day the work happened, but registering
    # something from last month must not drag the next date back into the
    # past: that older completion belongs to a cycle already closed.
    def rolled_due_on(moment)
      rolled = task.next_due_on(moment.to_date)
      return rolled if task.due_on.nil? || rolled >= task.due_on

      task.due_on
    end
  end
end
