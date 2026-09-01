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
      raise AlreadyReviewed, "completion was already reviewed" unless completion.pending?
      raise SelfReview, "you cannot review your own work" if completion.member_id == reviewer.id

      completion.update!(
        status: "approved",
        rating: rating,
        reviewer: reviewer,
        reviewed_at: now,
        points_awarded: Completion.points_for(completion.task_points, rating)
      )
      completion
    end

    private

    attr_reader :completion, :reviewer, :rating, :now
  end
end
