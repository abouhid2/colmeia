module Api
  module V1
    class CompletionsController < BaseController
      def index
        scope = completions.recent_first
        scope = scope.where(status: params[:status]) if params[:status].present?
        render json: scope.map { |completion| CompletionSerializer.call(completion) }
      end

      def review
        completion = completions.find(params[:id])
        reviewer = current_household.members.find(params.require(:reviewer_id))
        rating = Integer(params.require(:rating).to_s, 10)
        reviewed = Completions::Review.new(completion: completion, reviewer: reviewer, rating: rating).call
        render json: CompletionSerializer.call(reviewed)
      rescue Completions::Review::AlreadyReviewed, Completions::Review::SelfReview => e
        render_conflict(e.message)
      rescue ArgumentError
        render json: { error: "bad_request", details: [ "rating must be an integer" ] }, status: :bad_request
      end

      private

      def completions
        current_household.completions
      end
    end
  end
end
