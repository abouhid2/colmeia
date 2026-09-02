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
  def create_household(name: "Casa")
    Household.create!(name: name)
  end
end

RSpec.configure do |config|
  config.include ApiHelpers, type: :request
  config.include HouseholdFactory
  config.include ActiveSupport::Testing::TimeHelpers
end
