module Api
  module V1
    class TasksController < BaseController
      def index
        tasks = Task.order(:created_at)
        tasks = tasks.where(status: params[:status]) if params[:status].present?
        render json: tasks.map { |task| TaskSerializer.call(task) }
      end

      def create
        task = Task.create!(task_params)
        render json: TaskSerializer.call(task), status: :created
      end

      def update
        task = Task.find(params[:id])
        task.update!(task_params)
        render json: TaskSerializer.call(task)
      end

      def destroy
        Task.find(params[:id]).destroy!
        head :no_content
      end

      def complete
        task = Task.find(params[:id])
        member = Member.find(params.require(:member_id))
        result = Tasks::Complete.new(task: task, member: member).call
        render json: { task: TaskSerializer.call(result.task), completion: CompletionSerializer.call(result.completion) }
      rescue Tasks::Complete::AlreadyDone => e
        render_conflict(e.message)
      end

      private

      def task_params
        params.require(:task).permit(
          :title, :description, :points, :priority, :recurrence, :interval_days,
          :due_on, :requires_review, :assignee_id, :created_by_id, :status
        )
      end
    end
  end
end
