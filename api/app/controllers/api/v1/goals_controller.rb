module Api
  module V1
    class GoalsController < BaseController
      def show
        render json: GoalSerializer.call(Goal.current)
      end

      def update
        goal = Goal.current || Goal.new
        goal.update!(goal_params)
        render json: GoalSerializer.call(goal)
      end

      private

      def goal_params
        params.require(:goal).permit(:title, :target_points, :period)
      end
    end
  end
end
