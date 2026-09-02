module ApiHelpers
  def json_body
    JSON.parse(response.body)
  end

  # Scoped endpoints only answer when the colmeia's invite code travels with
  # the request.
  def headers_for(household)
    { Api::V1::BaseController::HOUSEHOLD_HEADER => household.invite_code }
  end
end

module HouseholdFactory
  # A colmeia always opens with one estação, the way the app creates it.
  def create_household(name: "Casa")
    Households::Create.new(name: name).call
  end

  # The estação a colmeia starts with, for specs that do not care which one.
  def season_of(household)
    household.seasons.first
  end
end

RSpec.configure do |config|
  config.include ApiHelpers, type: :request
  config.include HouseholdFactory
  config.include ActiveSupport::Testing::TimeHelpers
end
