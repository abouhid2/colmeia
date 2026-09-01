require "rails_helper"

RSpec.describe "Completions API", type: :request do
  let!(:worker) { Member.create!(name: "Bruno") }
  let!(:reviewer) { Member.create!(name: "Ana") }
  let!(:completion) do
    Completion.create!(member: worker, status: "pending", task_title: "Banheiro", task_points: 20, completed_at: Time.current)
  end

  it "lists pending completions" do
    get "/api/v1/completions", params: { status: "pending" }

    expect(json_body.map { |c| c["id"] }).to eq([ completion.id ])
  end

  it "reviews a completion" do
    post "/api/v1/completions/#{completion.id}/review", params: { reviewer_id: reviewer.id, rating: 4 }

    expect(response).to have_http_status(:ok)
    expect(json_body).to include("status" => "approved", "rating" => 4, "points_awarded" => 16)
  end

  it "rejects self review with 409" do
    post "/api/v1/completions/#{completion.id}/review", params: { reviewer_id: worker.id, rating: 5 }

    expect(response).to have_http_status(:conflict)
  end

  it "rejects a non-integer rating" do
    post "/api/v1/completions/#{completion.id}/review", params: { reviewer_id: reviewer.id, rating: "ótimo" }

    expect(response).to have_http_status(:bad_request)
  end
end
