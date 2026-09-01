require "rails_helper"

RSpec.describe "Goal API", type: :request do
  it "returns null when no goal is set" do
    get "/api/v1/goal"

    expect(response.body).to eq("null")
  end

  it "creates the goal on first update and edits it afterwards" do
    put "/api/v1/goal", params: { goal: { title: "Pizza", target_points: 300, period: "week" } }
    expect(json_body).to include("title" => "Pizza", "target_points" => 300)

    put "/api/v1/goal", params: { goal: { target_points: 400 } }
    expect(json_body["target_points"]).to eq(400)
    expect(Goal.count).to eq(1)
  end
end
