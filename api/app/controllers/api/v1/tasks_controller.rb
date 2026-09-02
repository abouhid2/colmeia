module Api
  module V1
    class TasksController < BaseController
      def index
        scope = tasks.order(:created_at)
        scope = scope.where(season_id: params[:season_id]) if params[:season_id].present?
        scope = scope.where(status: params[:status]) if params[:status].present?
        render json: scope.map { |task| TaskSerializer.call(task) }
      end

      def create
        return render_conflict(t_error(:season_closed)) if season_closed?(season_for(task_params[:season_id]))

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
        return render_conflict(t_error(:season_closed)) if season_closed?(task.season)

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

      # Nil for a missing or foreign id: the model validation answers that with 422.
      def season_for(id)
        current_household.seasons.find_by(id: id)
      end

      def task_params
        params.require(:task).permit(
          :title, :description, :points, :priority, :recurrence, :interval_days,
          :due_on, :requires_review, :kid_friendly, :assignee_id, :created_by_id, :season_id
        )
      end
    end
  end
end
