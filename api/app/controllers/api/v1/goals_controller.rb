module Api
  module V1
    class GoalsController < BaseController
      def index
        render json: goals.oldest_first.map { |goal| GoalSerializer.call(goal) }
      end

      def create
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

      def goal_params
        params.require(:goal).permit(:title, :target_points, :period, :member_id)
      end
    end
  end
end
