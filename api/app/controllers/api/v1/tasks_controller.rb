module Api
  module V1
    class TasksController < BaseController
      def index
        scope = tasks.order(:created_at)
        scope = scope.where(status: params[:status]) if params[:status].present?
        render json: scope.map { |task| TaskSerializer.call(task) }
      end

      def create
        task = tasks.create!(task_params)
        render json: TaskSerializer.call(task), status: :created
      end

      def update
        task = tasks.find(params[:id])
        task.update!(task_params)
        render json: TaskSerializer.call(task)
      end

      def destroy
        tasks.find(params[:id]).destroy!
        head :no_content
      end

      def complete
        task = tasks.find(params[:id])
        member = current_household.members.find(params.require(:member_id))
        result = Tasks::Complete.new(task: task, member: member).call
        render json: { task: TaskSerializer.call(result.task), completion: CompletionSerializer.call(result.completion) }
      rescue Tasks::Complete::AlreadyDone => e
        render_conflict(e.message)
      end

      def reopen
        task = Tasks::Reopen.new(task: tasks.find(params[:id])).call
        render json: TaskSerializer.call(task)
      rescue Tasks::Reopen::AlreadyOpen => e
        render_conflict(e.message)
      end

      private

      def tasks
        current_household.tasks
      end

      def task_params
        params.require(:task).permit(
          :title, :description, :points, :priority, :recurrence, :interval_days,
          :due_on, :requires_review, :assignee_id, :created_by_id
        )
      end
    end
  end
end
