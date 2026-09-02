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

  it "pins and unpins the badges shown on the profile" do
    member = household.members.create!(name: "Ana")

    patch "/api/v1/members/#{member.id}", params: { member: { favorite_achievements: %w[ firstTask bigTask ] } }, headers: headers
    expect(json_body["favorite_achievements"]).to eq(%w[ firstTask bigTask ])

    patch "/api/v1/members/#{member.id}", params: { member: { favorite_achievements: %w[ bigTask ] } }, headers: headers
    expect(json_body["favorite_achievements"]).to eq(%w[ bigTask ])
  end

  it "refuses to pin a fourth badge, or one that does not exist" do
    member = household.members.create!(name: "Ana")

    patch "/api/v1/members/#{member.id}",
      params: { member: { favorite_achievements: %w[ firstTask bigTask flawless sevenDays ] } }, headers: headers
    expect(response).to have_http_status(:unprocessable_content)

    patch "/api/v1/members/#{member.id}", params: { member: { favorite_achievements: %w[ melhorDaCasa ] } }, headers: headers
    expect(response).to have_http_status(:unprocessable_content)
    expect(json_body["details"].first).to include("Conquistas fixadas")
    expect(member.reload.favorite_achievements).to eq([])
  end

  it "serves a texture, defaults it to solid and lets somebody change it" do
    post "/api/v1/members", params: { member: { name: "Bruno", color: "sky" } }, headers: headers
    expect(json_body["pattern"]).to eq("solid")
    id = json_body["id"]

    patch "/api/v1/members/#{id}", params: { member: { pattern: "waves" } }, headers: headers
    expect(json_body["pattern"]).to eq("waves")
  end

  it "rejects unknown textures" do
    post "/api/v1/members", params: { member: { name: "X", pattern: "glitter" } }, headers: headers

    expect(response).to have_http_status(:unprocessable_content)
  end

  it "remembers the navigation one person arranged for themselves" do
    member = household.members.create!(name: "Ana")

    patch "/api/v1/members/#{member.id}",
      params: { member: { nav_preferences: { order: %w[ home seasons tasks ], hidden: %w[ shopping ] } } }, headers: headers

    expect(json_body["nav_preferences"]).to eq({ "order" => %w[ home seasons tasks ], "hidden" => %w[ shopping ] })
  end

  it "starts everybody on the navigation the app arranges by default" do
    post "/api/v1/members", params: { member: { name: "Bruno" } }, headers: headers

    expect(json_body["nav_preferences"]).to eq({ "order" => [], "hidden" => [] })
  end

  it "drops a screen it does not know instead of storing it" do
    member = household.members.create!(name: "Ana")

    patch "/api/v1/members/#{member.id}",
      params: { member: { nav_preferences: { order: %w[ garagem home ], hidden: %w[ home garagem ] } } }, headers: headers

    expect(response).to have_http_status(:ok)
    expect(member.reload.nav_preferences).to eq({ "order" => %w[ home ], "hidden" => [] })
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
