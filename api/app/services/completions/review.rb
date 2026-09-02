module Completions
  # Rates a pending completion and releases its points.
  class Review
    class AlreadyReviewed < StandardError; end
    class SelfReview < StandardError; end

    def initialize(completion:, reviewer:, rating:, now: Time.current)
      @completion = completion
      @reviewer = reviewer
      @rating = rating
      @now = now
    end

    def call
      raise ActiveRecord::RecordNotFound if completion.household_id != reviewer.household_id
      raise AlreadyReviewed, "Essa tarefa já foi avaliada" unless completion.pending?
      raise SelfReview, "Quem fez a tarefa não pode avaliar o próprio trabalho" if completion.member_id == reviewer.id

      completion.update!(
        status: "approved",
        rating: rating,
        reviewer: reviewer,
        reviewed_at: now,
        points_awarded: completion.points_for_rating(rating)
      )
      completion
    end

    private

    attr_reader :completion, :reviewer, :rating, :now
  end
end
