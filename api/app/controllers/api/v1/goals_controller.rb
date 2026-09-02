module Api
  module V1
    class GoalsController < BaseController
      def index
        scope = goals.oldest_first.includes(:goal_members)
        scope = scope.where(season_id: params[:season_id]) if params[:season_id].present?
        render json: scope.map { |goal| GoalSerializer.call(goal) }
      end

      def create
        return render_conflict(t_error(:season_closed)) if season_closed?(season_for(goal_params[:season_id]))

        goal = goals.create!(goal_params)
        render json: GoalSerializer.call(goal), status: :created
      end

      def update
        goal = goals.find(params[:id])
        goal.update!(goal_params)
        render json: GoalSerializer.call(goal)
      end

      def destroy
        goals.find(params[:id]).destroy!
        head :no_content
      end

      private

      def goals
        current_household.goals
      end

      # Nil for a missing or foreign id: the model validation answers that with 422.
      def season_for(id)
        current_household.seasons.find_by(id: id)
      end

      def goal_params
        params.require(:goal).permit(:title, :target_points, :season_id, :starts_on, :ends_on, member_ids: [])
      end
    end
  end
end
