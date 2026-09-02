require "rails_helper"

RSpec.describe "Members API", type: :request do
  let(:household) { create_household }
  let(:headers) { headers_for(household) }

  it "creates, updates and removes a member, keeping their completions" do
    post "/api/v1/members", params: { member: { name: "Duda", avatar: "🦉", color: "leaf" } }, headers: headers
    expect(response).to have_http_status(:created)
    id = json_body["id"]

    patch "/api/v1/members/#{id}", params: { member: { name: "Eduarda" } }, headers: headers
    expect(json_body["name"]).to eq("Eduarda")

    household.completions.create!(member_id: id, task_title: "Louça", task_points: 5, points_awarded: 5, completed_at: Time.current)
    delete "/api/v1/members/#{id}", headers: headers
    expect(response).to have_http_status(:no_content)
    expect(Completion.count).to eq(1)
  end

  it "reports whether each member has claimed their place" do
    household.members.create!(name: "Ana", claimed_at: Time.current)
    household.members.create!(name: "Bruno")

    get "/api/v1/members", headers: headers

    expect(json_body.map { |member| [ member["name"], member["claimed"] ] }).to eq([ [ "Ana", true ], [ "Bruno", false ] ])
  end

  it "turns a member into a lagartinha and reports the multiplier" do
    post "/api/v1/members", params: { member: { name: "Duda" } }, headers: headers
    id = json_body["id"]
    expect(json_body).to include("kind" => "bee", "points_multiplier" => 1.0)

    patch "/api/v1/members/#{id}", params: { member: { kind: "lagartinha" } }, headers: headers

    expect(json_body).to include("kind" => "lagartinha", "points_multiplier" => 1.5)
  end

  it "lets the family set the multiplier by hand" do
    member = household.members.create!(name: "Duda", kind: "lagartinha")

    patch "/api/v1/members/#{member.id}", params: { member: { points_multiplier: 1.2 } }, headers: headers

    expect(json_body["points_multiplier"]).to eq(1.2)
  end

  it "rejects a multiplier outside the sane range" do
    member = household.members.create!(name: "Duda")

    patch "/api/v1/members/#{member.id}", params: { member: { points_multiplier: 9 } }, headers: headers

    expect(response).to have_http_status(:unprocessable_content)
  end

  it "rejects unknown colors" do
    post "/api/v1/members", params: { member: { name: "X", color: "neon" } }, headers: headers

    expect(response).to have_http_status(:unprocessable_content)
  end
end
