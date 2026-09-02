module SeasonTitleVoteSerializer
  def self.call(vote)
    {
      id: vote.id,
      season_id: vote.season_id,
      season_title_id: vote.season_title_id,
      voter_id: vote.voter_id,
      votee_id: vote.votee_id
    }
  end
end
