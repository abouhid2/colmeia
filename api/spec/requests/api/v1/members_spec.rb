require "rails_helper"

RSpec.describe "Members API", type: :request do
  it "creates, updates and removes a member, keeping their completions" do
    post "/api/v1/members", params: { member: { name: "Duda", avatar: "🦉", color: "leaf" } }
    expect(response).to have_http_status(:created)
    id = json_body["id"]

    patch "/api/v1/members/#{id}", params: { member: { name: "Eduarda" } }
    expect(json_body["name"]).to eq("Eduarda")

    Completion.create!(member_id: id, task_title: "Louça", task_points: 5, points_awarded: 5, completed_at: Time.current)
    delete "/api/v1/members/#{id}"
    expect(response).to have_http_status(:no_content)
    expect(Completion.count).to eq(1)
  end

  it "rejects unknown colors" do
    post "/api/v1/members", params: { member: { name: "X", color: "neon" } }

    expect(response).to have_http_status(:unprocessable_content)
  end
end
