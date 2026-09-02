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

    household.completions.create!(season: season_of(household), member_id: id, task_title: "Louça", task_points: 5, points_awarded: 5, completed_at: Time.current)
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

  it "rejects unknown colors" do
    post "/api/v1/members", params: { member: { name: "X", color: "neon" } }, headers: headers

    expect(response).to have_http_status(:unprocessable_content)
  end

  it "gives new people the default crown title and lets them pick their own" do
    post "/api/v1/members", params: { member: { name: "Bruno", avatar: "\u{1F43B}", color: "sky" } }, headers: headers
    expect(json_body["crown_title"]).to eq("Abelha Rainha")
    id = json_body["id"]

    patch "/api/v1/members/#{id}", params: { member: { crown_title: "  Rei da Lou\u00e7a  " } }, headers: headers
    expect(json_body["crown_title"]).to eq("Rei da Lou\u00e7a")
  end

  it "takes a blank crown title as a way out of the crown" do
    post "/api/v1/members", params: { member: { name: "Clara", crown_title: "   " } }, headers: headers

    expect(response).to have_http_status(:created)
    expect(json_body["crown_title"]).to eq("")
  end

  it "keeps the crown title short enough to fit next to a name" do
    post "/api/v1/members", params: { member: { name: "X", crown_title: "a" * 31 } }, headers: headers

    expect(response).to have_http_status(:unprocessable_content)
    expect(json_body["details"]).to include(a_string_including("T\u00edtulo de vencedor"))
  end
end
