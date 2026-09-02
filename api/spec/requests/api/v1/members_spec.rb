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

  it "gives new people the default crown title and lets them pick their own" do
    post "/api/v1/members", params: { member: { name: "Bruno", avatar: "\u{1F43B}", color: "sky" } }
    expect(json_body["crown_title"]).to eq("Abelha Rainha")
    id = json_body["id"]

    patch "/api/v1/members/#{id}", params: { member: { crown_title: "  Rei da Lou\u00e7a  " } }
    expect(json_body["crown_title"]).to eq("Rei da Lou\u00e7a")
  end

  it "takes a blank crown title as a way out of the crown" do
    post "/api/v1/members", params: { member: { name: "Clara", crown_title: "   " } }

    expect(response).to have_http_status(:created)
    expect(json_body["crown_title"]).to eq("")
  end

  it "keeps the crown title short enough to fit next to a name" do
    post "/api/v1/members", params: { member: { name: "X", crown_title: "a" * 31 } }

    expect(response).to have_http_status(:unprocessable_content)
    expect(json_body["details"]).to include(a_string_including("T\u00edtulo de vencedor"))
  end
end
