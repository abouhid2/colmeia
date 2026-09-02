require "rails_helper"

RSpec.describe "Season titles API", type: :request do
  let(:household) { create_household }
  let(:headers) { headers_for(household) }
  let(:titles) { household.season_titles.in_order }
  let(:crown) { titles.find_by(kind: "auto") }
  let(:pernilongo) { titles.find_by(name: "Pernilongo") }

  describe "GET /api/v1/season_titles" do
    it "opens every colmeia with the crown first and the voted titles behind it" do
      get "/api/v1/season_titles", headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_body.map { |title| title["name"] }).to eq(
        [ "Vencedor da estação", "Pernilongo", "Abelhudo", "Mosca-morta", "Lesma", "Cigarra" ]
      )
      expect(json_body.first).to include("kind" => "auto", "emoji" => "👑", "active" => true, "position" => 0)
      expect(json_body.drop(1).map { |title| title["kind"] }).to all(eq("vote"))
    end

    it "never shows another colmeia's titles" do
      other = create_household(name: "Casa alheia")
      other.season_titles.first.update!(name: "Alheio")

      get "/api/v1/season_titles", headers: headers

      expect(json_body.map { |title| title["name"] }).not_to include("Alheio")
    end

    it "asks for the colmeia" do
      get "/api/v1/season_titles"

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "POST /api/v1/season_titles" do
    it "adds a voted title at the end of the list" do
      post "/api/v1/season_titles",
        params: { season_title: { name: "Formiga", emoji: "🐜", description: "Carrega o dobro do próprio peso." } },
        headers: headers

      expect(response).to have_http_status(:created)
      expect(json_body).to include("name" => "Formiga", "emoji" => "🐜", "kind" => "vote", "active" => true, "position" => 6)
    end

    it "refuses a nameless title and one longer than the field" do
      post "/api/v1/season_titles", params: { season_title: { name: "  ", emoji: "🐜" } }, headers: headers
      expect(response).to have_http_status(:unprocessable_content)

      post "/api/v1/season_titles", params: { season_title: { name: "a" * 31, emoji: "🐜" } }, headers: headers
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "refuses a title with no emoji" do
      post "/api/v1/season_titles", params: { season_title: { name: "Formiga", emoji: "" } }, headers: headers

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "PATCH /api/v1/season_titles/:id" do
    it "renames, re-describes and reorders a title" do
      patch "/api/v1/season_titles/#{pernilongo.id}",
        params: { season_title: { name: "Muriçoca", emoji: "🦟", description: "Zumbiu a estação inteira.", position: 9 } },
        headers: headers

      expect(json_body).to include("name" => "Muriçoca", "description" => "Zumbiu a estação inteira.", "position" => 9)
    end

    it "renames the crown without letting it become a voted title" do
      patch "/api/v1/season_titles/#{crown.id}",
        params: { season_title: { name: "Abelha suprema", kind: "vote" } }, headers: headers

      expect(json_body).to include("name" => "Abelha suprema", "kind" => "auto")
    end

    it "turns a title off without deleting it" do
      patch "/api/v1/season_titles/#{pernilongo.id}", params: { season_title: { active: false } }, headers: headers

      expect(json_body).to include("active" => false)
      expect(pernilongo.reload).to be_present
    end

    it "cannot touch another colmeia's title" do
      other = create_household(name: "Casa alheia")

      patch "/api/v1/season_titles/#{other.season_titles.first.id}",
        params: { season_title: { name: "Sequestrado" } }, headers: headers

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "DELETE /api/v1/season_titles/:id" do
    it "deletes a voted title nobody used" do
      delete "/api/v1/season_titles/#{pernilongo.id}", headers: headers

      expect(response).to have_http_status(:no_content)
      expect(household.season_titles.exists?(name: "Pernilongo")).to be(false)
    end

    it "keeps the votes of a title that was already handed out and turns it off" do
      season = season_of(household)
      season.update!(closed_at: Time.current)
      voter = household.members.create!(name: "Ana")
      household.season_title_votes.create!(season: season, season_title: pernilongo, voter: voter, votee: voter)

      delete "/api/v1/season_titles/#{pernilongo.id}", headers: headers

      expect(response).to have_http_status(:no_content)
      expect(pernilongo.reload.active).to be(false)
      expect(household.season_title_votes.count).to eq(1)
    end

    it "keeps the crown, which the ranking awards on its own" do
      delete "/api/v1/season_titles/#{crown.id}", headers: headers

      expect(response).to have_http_status(:conflict)
      expect(json_body["details"].first).to include("a coroa fica na lista")
      expect(crown.reload).to be_present
    end
  end
end
