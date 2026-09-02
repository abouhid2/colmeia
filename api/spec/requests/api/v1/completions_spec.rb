require "rails_helper"

RSpec.describe "Completions API", type: :request do
  let(:household) { create_household }
  let(:headers) { headers_for(household) }
  let(:season) { season_of(household) }
  let!(:worker) { household.members.create!(name: "Bruno") }
  let!(:reviewer) { household.members.create!(name: "Ana") }
  let!(:completion) do
    household.completions.create!(season: season, member: worker, status: "pending", task_title: "Banheiro", task_points: 20, completed_at: Time.current)
  end

  it "lists pending completions" do
    get "/api/v1/completions", params: { status: "pending" }, headers: headers

    expect(json_body.map { |c| c["id"] }).to eq([ completion.id ])
  end

  it "reviews a completion" do
    post "/api/v1/completions/#{completion.id}/review", params: { reviewer_id: reviewer.id, rating: 4 }, headers: headers

    expect(response).to have_http_status(:ok)
    expect(json_body).to include("status" => "approved", "rating" => 4, "points_awarded" => 16)
  end

  it "rejects self review with 409" do
    post "/api/v1/completions/#{completion.id}/review", params: { reviewer_id: worker.id, rating: 5 }, headers: headers

    expect(response).to have_http_status(:conflict)
  end

  it "rejects a non-integer rating instead of truncating it" do
    post "/api/v1/completions/#{completion.id}/review", params: { reviewer_id: reviewer.id, rating: "ótimo" }, headers: headers
    expect(response).to have_http_status(:bad_request)

    post "/api/v1/completions/#{completion.id}/review", params: { reviewer_id: reviewer.id, rating: 3.9 }, as: :json, headers: headers
    expect(response).to have_http_status(:bad_request)
    expect(completion.reload).to be_pending
  end
end
