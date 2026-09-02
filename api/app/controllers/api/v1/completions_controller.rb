module Api
  module V1
    class CompletionsController < BaseController
      MAX_LIMIT = 1000

      def index
        scope = completions.recent_first
        scope = scope.where(season_id: params[:season_id]) if params[:season_id].present?
        scope = scope.where(status: params[:status]) if params[:status].present?
        limit = page_limit
        scope = scope.limit(limit) if limit
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
        render json: { error: "bad_request", details: [ "A nota precisa ser um número de 1 a 5" ] }, status: :bad_request
      end

      private

      # A slice of the history, newest first, only when one is asked for: the
      # ranking, the achievements and the crown are counted from all of it.
      def page_limit
        Integer(params[:limit], exception: false)&.clamp(1, MAX_LIMIT)
      end

      def completions
        current_household.completions
      end
    end
  end
end
