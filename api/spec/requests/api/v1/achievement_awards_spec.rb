require "rails_helper"

RSpec.describe "Achievement awards API", type: :request do
  let(:household) { create_household }
  let(:headers) { headers_for(household) }
  let(:ana) { household.members.create!(name: "Ana") }
  let(:bruno) { household.members.create!(name: "Bruno") }

  def record(member, rows)
    post "/api/v1/achievement_awards", params: { member_id: member.id, awards: rows }, headers: headers, as: :json
  end

  def row(key, completion_id: nil, awarded_at: "2026-03-01T10:00:00Z")
    { key: key, completion_id: completion_id, awarded_at: awarded_at }
  end

  it "writes down what is missing and leaves what is already there alone" do
    record(ana, [ row("firstTask") ])
    expect(response).to have_http_status(:created)

    record(ana, [ row("firstTask"), row("bigTask", completion_id: 3, awarded_at: "2026-03-02T10:00:00Z") ])

    expect(response).to have_http_status(:created)
    expect(json_body.map { |award| award["key"] }).to eq(%w[ firstTask bigTask ])
    expect(AchievementAward.count).to eq(2)
  end

  it "answers without creating anything when the batch is already stored" do
    record(ana, [ row("firstTask") ])

    record(ana, [ row("firstTask") ])

    expect(response).to have_http_status(:ok)
    expect(AchievementAward.count).to eq(1)
  end

  it "counts a repeatable badge once per completion" do
    record(ana, [ row("bigTask", completion_id: 1), row("bigTask", completion_id: 2), row("bigTask", completion_id: 2) ])

    expect(json_body.count).to eq(2)
  end

  it "keeps the badge after the completion that earned it is deleted" do
    completion = household.completions.create!(
      season: season_of(household), member: ana, task_title: "Trocar a resistência", task_points: 50,
      points_awarded: 50, completed_at: Time.current
    )
    record(ana, [ row("bigTask", completion_id: completion.id) ])

    completion.destroy!
    get "/api/v1/achievement_awards", params: { member_id: ana.id }, headers: headers

    expect(json_body.map { |award| award["completion_id"] }).to eq([ completion.id ])
  end

  it "lists one person's badges or the whole colmeia's" do
    record(ana, [ row("firstTask") ])
    record(bruno, [ row("flawless", completion_id: 4) ])

    get "/api/v1/achievement_awards", params: { member_id: bruno.id }, headers: headers
    expect(json_body.map { |award| award["key"] }).to eq(%w[ flawless ])

    get "/api/v1/achievement_awards", headers: headers
    expect(json_body.map { |award| award["key"] }).to match_array(%w[ firstTask flawless ])
  end

  it "refuses a badge that does not exist" do
    record(ana, [ row("melhorDaCasa") ])

    expect(response).to have_http_status(:unprocessable_content)
    expect(AchievementAward.count).to eq(0)
  end

  it "refuses to write badges for someone from another colmeia" do
    stranger = create_household(name: "Casa alheia").members.create!(name: "Estranho")

    post "/api/v1/achievement_awards", params: { member_id: stranger.id, awards: [ row("firstTask") ] }, headers: headers, as: :json

    expect(response).to have_http_status(:not_found)
    expect(AchievementAward.count).to eq(0)
  end
end
