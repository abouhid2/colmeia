require "rails_helper"

RSpec.describe "Goals API", type: :request do
  let(:household) { create_household }
  let(:headers) { headers_for(household) }
  let(:season) { season_of(household) }
  let!(:member) { household.members.create!(name: "Duda") }

  it "starts empty" do
    get "/api/v1/goals", headers: headers

    expect(json_body).to eq([])
  end

  it "creates household and personal goals, edits and removes them" do
    post "/api/v1/goals", params: { goal: { title: "Pizza", target_points: 300, season_id: season.id } }, headers: headers
    expect(response).to have_http_status(:created)
    expect(json_body).to include("title" => "Pizza", "member_id" => nil)

    post "/api/v1/goals", params: { goal: { title: "Sorvete", target_points: 30, season_id: season.id, member_id: member.id } }, headers: headers
    personal_id = json_body["id"]
    expect(json_body["member_id"]).to eq(member.id)

    patch "/api/v1/goals/#{personal_id}", params: { goal: { target_points: 40 } }, headers: headers
    expect(json_body["target_points"]).to eq(40)

    delete "/api/v1/goals/#{personal_id}", headers: headers
    expect(response).to have_http_status(:no_content)

    get "/api/v1/goals", headers: headers
    expect(json_body.map { |goal| goal["title"] }).to eq([ "Pizza" ])
  end

  it "rejects a goal without points" do
    post "/api/v1/goals", params: { goal: { title: "Nada", target_points: 0, season_id: season.id } }, headers: headers

    expect(response).to have_http_status(:unprocessable_content)
  end

  it "drops personal goals when the member leaves" do
    household.goals.create!(season: season, title: "Sorvete", target_points: 30, member: member)
    household.goals.create!(season: season, title: "Pizza", target_points: 300)

    delete "/api/v1/members/#{member.id}", headers: headers

    expect(household.goals.pluck(:title)).to eq([ "Pizza" ])
  end
end
