require "rails_helper"

RSpec.describe "Households API", type: :request do
  describe "POST /api/v1/households" do
    it "creates a colmeia with its placeholder members and an invite code" do
      post "/api/v1/households", params: { household: { name: "Família Silva", member_names: [ "Ana", "Bruno", "Clara" ] } }

      expect(response).to have_http_status(:created)
      expect(json_body).to include("name" => "Família Silva")
      expect(json_body["invite_code"]).to match(/\A[a-z0-9]{#{Household::INVITE_CODE_LENGTH}}\z/)
      expect(json_body["members"].map { |member| member["name"] }).to eq(%w[ Ana Bruno Clara ])
      expect(json_body["members"].map { |member| member["claimed"] }).to all(be(false))
      expect(json_body["members"].map { |member| member["color"] }.uniq.size).to eq(3)
    end

    it "needs no invite code of its own" do
      post "/api/v1/households", params: { household: { name: "Sem cabeçalho" } }

      expect(response).to have_http_status(:created)
      expect(json_body["members"]).to eq([])
    end

    it "ignores blank names in the list" do
      post "/api/v1/households", params: { household: { name: "Casa", member_names: [ "Ana", "", "   " ] } }

      expect(json_body["members"].map { |member| member["name"] }).to eq([ "Ana" ])
    end

    it "trims the names it is given" do
      post "/api/v1/households", params: { household: { name: "  Casa  ", member_names: [ "  Ana  " ] } }

      expect(json_body["name"]).to eq("Casa")
      expect(json_body["members"].map { |member| member["name"] }).to eq([ "Ana" ])
    end

    it "refuses a list longer than a house holds" do
      names = Array.new(Households::Create::MAX_MEMBER_NAMES + 1) { |index| "Pessoa #{index}" }

      post "/api/v1/households", params: { household: { name: "Multidão", member_names: names } }

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_body["details"].first).to include("no máximo #{Households::Create::MAX_MEMBER_NAMES} pessoas")
      expect(Household.where(name: "Multidão")).to be_empty
    end

    it "rejects a colmeia with no name" do
      post "/api/v1/households", params: { household: { name: "" } }

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "GET /api/v1/households/:invite_code" do
    it "is public and says who is still missing" do
      household = create_household(name: "Casa")
      household.members.create!(name: "Ana", claimed_at: Time.current)
      household.members.create!(name: "Bruno")

      get "/api/v1/households/#{household.invite_code}"

      expect(response).to have_http_status(:ok)
      expect(json_body).to include("id" => household.id, "name" => "Casa", "invite_code" => household.invite_code)
      expect(json_body["members"].map { |member| [ member["name"], member["claimed"] ] }).to eq([ [ "Ana", true ], [ "Bruno", false ] ])
    end

    it "answers to the code however it was typed" do
      household = create_household(name: "Casa")

      get "/api/v1/households/#{household.invite_code.upcase}"

      expect(response).to have_http_status(:ok)
      expect(json_body["invite_code"]).to eq(household.invite_code)
    end

    it "answers 404 for a code nobody owns" do
      get "/api/v1/households/naoexiste"

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/households/:invite_code/claim" do
    let(:household) { create_household }
    let!(:member) { household.members.create!(name: "Ana") }

    it "hands the placeholder to whoever opened the link" do
      post "/api/v1/households/#{household.invite_code}/claim", params: { member_id: member.id }

      expect(response).to have_http_status(:ok)
      expect(json_body).to include("id" => member.id, "claimed" => true)
      expect(json_body["claimed_at"]).to be_present
      expect(member.reload).to be_claimed
    end

    it "answers 409 the second time" do
      post "/api/v1/households/#{household.invite_code}/claim", params: { member_id: member.id }
      post "/api/v1/households/#{household.invite_code}/claim", params: { member_id: member.id }

      expect(response).to have_http_status(:conflict)
    end

    it "refuses a member from another colmeia" do
      stranger = create_household(name: "Outra").members.create!(name: "Bruno")

      post "/api/v1/households/#{household.invite_code}/claim", params: { member_id: stranger.id }

      expect(response).to have_http_status(:not_found)
      expect(stranger.reload).not_to be_claimed
    end
  end

  describe "POST /api/v1/households/:invite_code/join" do
    let(:household) { create_household }

    it "adds a person the list did not have, already claimed" do
      post "/api/v1/households/#{household.invite_code}/join", params: { member: { name: "Duda", avatar: "🦉", color: "leaf" } }

      expect(response).to have_http_status(:created)
      expect(json_body).to include("name" => "Duda", "avatar" => "🦉", "color" => "leaf", "claimed" => true)
      expect(household.members.count).to eq(1)
    end

    it "trims the name it is given" do
      post "/api/v1/households/#{household.invite_code}/join", params: { member: { name: "  Duda  " } }

      expect(json_body["name"]).to eq("Duda")
    end

    it "rejects a person with no name" do
      post "/api/v1/households/#{household.invite_code}/join", params: { member: { name: "" } }

      expect(response).to have_http_status(:unprocessable_content)
    end

    it "refuses to add someone to a colmeia that is already full" do
      Member::MAX_PER_HOUSEHOLD.times { |index| household.members.create!(name: "Pessoa #{index}") }

      post "/api/v1/households/#{household.invite_code}/join", params: { member: { name: "Duda" } }

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_body["details"].first).to include("já tem #{Member::MAX_PER_HOUSEHOLD} pessoas")
    end

    it "answers 404 for a code nobody owns" do
      post "/api/v1/households/naoexiste/join", params: { member: { name: "Duda" } }

      expect(response).to have_http_status(:not_found)
    end
  end
end
