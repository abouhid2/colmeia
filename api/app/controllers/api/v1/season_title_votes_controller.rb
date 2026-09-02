module Api
  module V1
    class SeasonTitleVotesController < BaseController
      # Every vote of the colmeia: a profile counts titles across estações.
      def index
        render json: votes.map { |vote| SeasonTitleVoteSerializer.call(vote) }
      end

      # Every vote of one estação, so the tallies are counted on screen.
      def show
        render json: votes.where(season: season).map { |vote| SeasonTitleVoteSerializer.call(vote) }
      end

      # One vote per person per title: voting again changes it.
      def update
        return render_conflict(t_error(:season_voting_closed)) unless season.closed?

        vote = own_vote || votes.new(season: season, season_title_id: vote_params[:season_title_id], voter_id: vote_params[:voter_id])
        vote.votee_id = vote_params[:votee_id]
        vote.save!
        render json: SeasonTitleVoteSerializer.call(vote)
      end

      # Taking a vote back. Nothing to take back is the same outcome.
      def destroy
        own_vote&.destroy!
        head :no_content
      end

      private

      def votes
        current_household.season_title_votes
      end

      def season
        @season ||= current_household.seasons.find(params[:season_id])
      end

      def own_vote
        votes.find_by(
          season: season, season_title_id: vote_params[:season_title_id], voter_id: vote_params[:voter_id]
        )
      end

      def vote_params
        params.permit(:season_title_id, :votee_id, :voter_id)
      end
    end
  end
end
