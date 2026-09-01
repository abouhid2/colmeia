require "rails_helper"

RSpec.describe "Goals API", type: :request do
  let!(:member) { Member.create!(name: "Duda") }

  it "starts empty" do
    get "/api/v1/goals"

    expect(json_body).to eq([])
  end

  it "creates household and personal goals, edits and removes them" do
    post "/api/v1/goals", params: { goal: { title: "Pizza", target_points: 300, period: "week" } }
    expect(response).to have_http_status(:created)
    expect(json_body).to include("title" => "Pizza", "member_id" => nil)

    post "/api/v1/goals", params: { goal: { title: "Sorvete", target_points: 30, period: "week", member_id: member.id } }
    personal_id = json_body["id"]
    expect(json_body["member_id"]).to eq(member.id)

    patch "/api/v1/goals/#{personal_id}", params: { goal: { target_points: 40 } }
    expect(json_body["target_points"]).to eq(40)

    delete "/api/v1/goals/#{personal_id}"
    expect(response).to have_http_status(:no_content)

    get "/api/v1/goals"
    expect(json_body.map { |goal| goal["title"] }).to eq([ "Pizza" ])
  end

  it "rejects a goal without points" do
    post "/api/v1/goals", params: { goal: { title: "Nada", target_points: 0 } }

    expect(response).to have_http_status(:unprocessable_content)
  end

  it "drops personal goals when the member leaves" do
    Goal.create!(title: "Sorvete", target_points: 30, member: member)
    Goal.create!(title: "Pizza", target_points: 300)

    delete "/api/v1/members/#{member.id}"

    expect(Goal.pluck(:title)).to eq([ "Pizza" ])
  end
end
