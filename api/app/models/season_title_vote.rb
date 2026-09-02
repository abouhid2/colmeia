# One person saying who was the Pernilongo of an estação. Voting opens when the
# estação closes, and voting again changes the vote instead of adding one.
class SeasonTitleVote < ApplicationRecord
  include HouseholdScoped

  belongs_to_in_household :season
  belongs_to_in_household :season_title
  belongs_to_in_household :voter, class_name: "Member"
  belongs_to_in_household :votee, class_name: "Member"

  validates :voter_id, uniqueness: { scope: %i[ season_id season_title_id ], message: :already_voted }
  validate :title_is_voted_on

  private

  # The crown is won on points, not on votes.
  def title_is_voted_on
    return if season_title.nil? || !season_title.auto?

    errors.add(:season_title, :not_voted_on)
  end
end
