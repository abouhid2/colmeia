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

  # A colmeia running for years should not send its whole archive to a phone.
  context "with a longer history" do
    let(:base) { Time.zone.local(2026, 3, 10, 12) }

    before do
      completion.update!(completed_at: base - 10.hours)
      3.times do |index|
        household.completions.create!(season: season, member: worker, status: "approved", points_awarded: 5, task_title: "Louça #{index}",
          task_points: 5, completed_at: base - index.hours)
      end
    end

    it "answers with the newest slice when a limit is asked for" do
      get "/api/v1/completions", params: { limit: 2 }, headers: headers

      expect(json_body.map { |c| c["task_title"] }).to eq([ "Louça 0", "Louça 1" ])
    end

    it "leaves nothing out when nobody asks for a slice" do
      get "/api/v1/completions", headers: headers

      expect(json_body.map { |c| c["task_title"] }).to eq([ "Louça 0", "Louça 1", "Louça 2", "Banheiro" ])
    end

    it "ignores a limit that makes no sense" do
      get "/api/v1/completions", params: { limit: "todas" }, headers: headers

      expect(json_body.map { |c| c["task_title"] }).to eq([ "Louça 0", "Louça 1", "Louça 2", "Banheiro" ])
    end

    it "never sends more than its hard ceiling" do
      stub_const("Api::V1::CompletionsController::MAX_LIMIT", 2)

      get "/api/v1/completions", params: { limit: 100_000 }, headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_body.map { |c| c["task_title"] }).to eq([ "Louça 0", "Louça 1" ])
    end
  end

  it "reviews a completion" do
    post "/api/v1/completions/#{completion.id}/review", params: { reviewer_id: reviewer.id, rating: 4 }, headers: headers

    expect(response).to have_http_status(:ok)
    expect(json_body).to include("status" => "approved", "rating" => 4, "points_awarded" => 16)
  end

  it "refuses to review into a closed estação with 409" do
    season.update!(closed_at: Time.current)

    post "/api/v1/completions/#{completion.id}/review", params: { reviewer_id: reviewer.id, rating: 5 }, headers: headers

    expect(response).to have_http_status(:conflict)
    expect(json_body["details"]).to eq([ "Essa estação já foi encerrada" ])
    expect(completion.reload).to be_pending
    expect(completion.points_awarded).to eq(0)
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
