module Api
  module V1
    class AchievementAwardsController < BaseController
      def index
        render json: awards.oldest_first.map { |award| AchievementAwardSerializer.call(award) }
      end

      # Takes everything the app derived for one person and keeps what is new.
      def create
        member = current_household.members.find(params.require(:member_id))
        recorded = AchievementAwards::Record.new(household: current_household, member: member, rows: award_rows).call
        render json: member_awards(member), status: recorded.empty? ? :ok : :created
      end

      private

      def awards
        scope = current_household.achievement_awards
        params[:member_id].present? ? scope.where(member_id: params[:member_id]) : scope
      end

      def member_awards(member)
        current_household.achievement_awards.where(member_id: member.id).oldest_first
          .map { |award| AchievementAwardSerializer.call(award) }
      end

      def award_rows
        params.require(:awards).map { |award| award.permit(:key, :completion_id, :awarded_at) }
      end
    end
  end
end
