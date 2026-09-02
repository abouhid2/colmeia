require "rails_helper"

RSpec.describe "Goals API", type: :request do
  let(:household) { create_household }
  let(:headers) { headers_for(household) }
  let(:season) { season_of(household) }
  let!(:member) { household.members.create!(name: "Duda") }
  let!(:other_member) { household.members.create!(name: "Ana") }

  it "starts empty" do
    get "/api/v1/goals", headers: headers

    expect(json_body).to eq([])
  end

  it "creates goals for the colmeia, for one person and for a group" do
    post "/api/v1/goals", params: { goal: { title: "Pizza", target_points: 300, season_id: season.id } }, headers: headers
    expect(response).to have_http_status(:created)
    expect(json_body).to include("title" => "Pizza", "member_ids" => [], "starts_on" => nil, "ends_on" => nil)

    post "/api/v1/goals", params: { goal: { title: "Sorvete", target_points: 30, season_id: season.id, member_ids: [ member.id ] } }, headers: headers
    personal_id = json_body["id"]
    expect(json_body["member_ids"]).to eq([ member.id ])

    post "/api/v1/goals",
      params: { goal: { title: "Sorvete duplo", target_points: 40, season_id: season.id, member_ids: [ other_member.id, member.id ] } },
      headers: headers
    expect(json_body["member_ids"]).to eq([ member.id, other_member.id ].sort)

    patch "/api/v1/goals/#{personal_id}", params: { goal: { target_points: 40 } }, headers: headers
    expect(json_body).to include("target_points" => 40, "member_ids" => [ member.id ])

    delete "/api/v1/goals/#{personal_id}", headers: headers
    expect(response).to have_http_status(:no_content)

    get "/api/v1/goals", headers: headers
    expect(json_body.map { |goal| goal["title"] }).to eq([ "Pizza", "Sorvete duplo" ])
  end

  it "hands a goal back to the whole colmeia when the list comes back empty" do
    goal = household.goals.create!(season: season, title: "Sorvete", target_points: 30, member_ids: [ member.id ])

    patch "/api/v1/goals/#{goal.id}", params: { goal: { member_ids: [] } }, headers: headers

    expect(json_body["member_ids"]).to eq([])
    expect(goal.reload.goal_members).to be_empty
  end

  it "keeps the same person only once" do
    post "/api/v1/goals",
      params: { goal: { title: "Sorvete", target_points: 30, season_id: season.id, member_ids: [ member.id, member.id ] } },
      headers: headers

    expect(json_body["member_ids"]).to eq([ member.id ])
  end

  it "refuses somebody from another colmeia" do
    stranger = create_household(name: "Outra").members.create!(name: "Estranho")

    post "/api/v1/goals",
      params: { goal: { title: "Sorvete", target_points: 30, season_id: season.id, member_ids: [ stranger.id ] } },
      headers: headers

    expect(response).to have_http_status(:unprocessable_content)
    expect(json_body["details"]).to eq([ "Escolha só quem mora nesta colmeia" ])
    expect(household.goals).to be_empty
  end

  it "rejects a goal without points" do
    post "/api/v1/goals", params: { goal: { title: "Nada", target_points: 0, season_id: season.id } }, headers: headers

    expect(response).to have_http_status(:unprocessable_content)
  end

  describe "the window inside the estação" do
    let(:season) { household.seasons.create!(name: "Trimestre", starts_on: Date.new(2026, 9, 1), ends_on: Date.new(2026, 11, 30)) }

    it "keeps the days it was given" do
      post "/api/v1/goals",
        params: { goal: { title: "Primeiro mês", target_points: 100, season_id: season.id, starts_on: "2026-09-01", ends_on: "2026-09-30" } },
        headers: headers

      expect(response).to have_http_status(:created)
      expect(json_body).to include("starts_on" => "2026-09-01", "ends_on" => "2026-09-30")
    end

    it "refuses a window that pokes out of the estação" do
      post "/api/v1/goals",
        params: { goal: { title: "Depois", target_points: 100, season_id: season.id, starts_on: "2026-09-01", ends_on: "2026-12-15" } },
        headers: headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_body["details"]).to eq([ "A meta precisa caber dentro da estação" ])
    end

    it "refuses a window that ends before it starts" do
      post "/api/v1/goals",
        params: { goal: { title: "Invertida", target_points: 100, season_id: season.id, starts_on: "2026-09-30", ends_on: "2026-09-01" } },
        headers: headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_body["details"]).to include("O fim vem antes do começo")
    end

    it "lets a goal of an estação with no end sit anywhere after its opening" do
      open_season = household.seasons.create!(name: "Sem fim", starts_on: Date.new(2026, 9, 1))

      post "/api/v1/goals",
        params: { goal: { title: "Lá na frente", target_points: 100, season_id: open_season.id, starts_on: "2027-01-01" } },
        headers: headers

      expect(response).to have_http_status(:created)
    end
  end

  describe "when somebody leaves" do
    it "drops a goal only that person was in and keeps the shared ones" do
      household.goals.create!(season: season, title: "Sorvete", target_points: 30, member_ids: [ member.id ])
      household.goals.create!(season: season, title: "Sorvete duplo", target_points: 40, member_ids: [ member.id, other_member.id ])
      household.goals.create!(season: season, title: "Pizza", target_points: 300)

      delete "/api/v1/members/#{member.id}", headers: headers

      expect(household.goals.pluck(:title)).to contain_exactly("Sorvete duplo", "Pizza")
      expect(household.goals.find_by!(title: "Sorvete duplo").member_ids).to eq([ other_member.id ])
    end
  end
end
