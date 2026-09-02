module Tasks
  # Records that a member finished a task. One-off tasks close; recurring
  # tasks roll their due date forward. Tasks that require review create a
  # pending completion worth nothing until someone rates it. The estação is
  # stamped on the completion, so the history survives the task being deleted.
  class Complete
    class AlreadyDone < StandardError; end

    Result = Struct.new(:task, :completion, keyword_init: true)

    def initialize(task:, member:, now: Time.current)
      @task = task
      @member = member
      @now = now
    end

    def call
      raise ActiveRecord::RecordNotFound if task.household_id != member.household_id
      raise AlreadyDone, "task is already done" if task.done?

      ActiveRecord::Base.transaction do
        completion = task.completions.create!(completion_attributes)
        advance_task!
        Result.new(task: task, completion: completion)
      end
    end

    private

    attr_reader :task, :member, :now

    def completion_attributes
      {
        household_id: task.household_id,
        season_id: task.season_id,
        member: member,
        status: task.requires_review? ? "pending" : "approved",
        points_awarded: task.requires_review? ? 0 : member.award(task.points),
        multiplier: member.points_multiplier,
        task_title: task.title,
        task_points: task.points,
        completed_at: now
      }
    end

    def advance_task!
      if task.recurring?
        task.update!(due_on: task.next_due_on(now.to_date))
      else
        task.update!(status: "done", completed_at: now)
      end
    end
  end
end
