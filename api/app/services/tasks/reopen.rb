module Tasks
  # Putting a task back on the list undoes the completion that closed it,
  # points included. Otherwise finishing it a second time pays twice for the
  # same work.
  class Reopen
    class AlreadyOpen < StandardError; end

    def initialize(task:)
      @task = task
    end

    def call
      raise AlreadyOpen, "task is already open" unless task.done?

      task.transaction do
        closing_completion&.destroy!
        task.update!(status: "open", completed_at: nil)
      end
      task
    end

    private

    attr_reader :task

    def closing_completion
      task.completions.order(completed_at: :desc, id: :desc).first
    end
  end
end
