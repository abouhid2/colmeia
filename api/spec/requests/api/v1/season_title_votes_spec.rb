require "rails_helper"

RSpec.describe "Season title votes API", type: :request do
  let(:household) { create_household }
  let(:headers) { headers_for(household) }
  let(:season) { season_of(household) }
  let(:titles) { household.season_titles }
  let(:crown) { titles.find_by(kind: "auto") }
  let(:pernilongo) { titles.find_by(name: "Pernilongo") }
  let(:lesma) { titles.find_by(name: "Lesma") }
  let!(:ana) { household.members.create!(name: "Ana") }
  let!(:bruno) { household.members.create!(name: "Bruno") }

  def vote!(title: nil, voter: ana, votee: bruno)
    put "/api/v1/seasons/#{season.id}/votes",
      params: { season_title_id: (title || pernilongo).id, voter_id: voter.id, votee_id: votee.id },
      headers: headers
  end

  describe "while the estação is running" do
    it "takes no vote" do
      vote!

      expect(response).to have_http_status(:conflict)
      expect(json_body["details"]).to eq([ "A votação abre quando a estação encerrar" ])
      expect(household.season_title_votes.count).to eq(0)
    end
  end

  describe "once the estação is closed" do
    before { season.update!(closed_at: Time.current) }

    it "records a vote" do
      vote!

      expect(response).to have_http_status(:ok)
      expect(json_body).to include("season_id" => season.id, "season_title_id" => pernilongo.id, "voter_id" => ana.id, "votee_id" => bruno.id)
    end

    it "changes the vote instead of adding a second one" do
      vote!(votee: bruno)
      vote!(votee: ana)

      expect(response).to have_http_status(:ok)
      expect(household.season_title_votes.pluck(:votee_id)).to eq([ ana.id ])
    end

    it "lets someone vote for themselves" do
      vote!(voter: ana, votee: ana)

      expect(response).to have_http_status(:ok)
    end

    it "keeps one vote per title, so the same person votes in each" do
      vote!(title: pernilongo, votee: bruno)
      vote!(title: lesma, votee: ana)

      expect(household.season_title_votes.count).to eq(2)
    end

    it "refuses a vote on the crown, which the ranking decides" do
      vote!(title: crown)

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_body["details"].first).to include("a coroa ninguém vota")
    end

    it "refuses a vote for somebody from another colmeia" do
      stranger = create_household(name: "Casa alheia").members.create!(name: "Estranho")

      vote!(votee: stranger)

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_body["details"].first).to include("não é desta colmeia")
    end

    it "takes a vote back" do
      vote!

      delete "/api/v1/seasons/#{season.id}/votes",
        params: { season_title_id: pernilongo.id, voter_id: ana.id }, headers: headers

      expect(response).to have_http_status(:no_content)
      expect(household.season_title_votes.count).to eq(0)
    end

    it "lists the votes of the estação, so the tallies are counted on screen" do
      vote!(voter: ana, votee: bruno)
      vote!(voter: bruno, votee: bruno)

      get "/api/v1/seasons/#{season.id}/votes", headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_body.map { |vote| vote["votee_id"] }).to eq([ bruno.id, bruno.id ])
    end

    it "lists every vote of the colmeia, for the titles on a profile" do
      vote!
      other_season = household.seasons.create!(name: "Anterior", starts_on: Date.current - 30, closed_at: Time.current)
      household.season_title_votes.create!(season: other_season, season_title: lesma, voter: bruno, votee: ana)

      get "/api/v1/season_title_votes", headers: headers

      expect(json_body.map { |vote| vote["season_id"] }).to contain_exactly(season.id, other_season.id)
    end
  end

  describe "another colmeia" do
    let(:other) { create_household(name: "Casa alheia") }

    before { season.update!(closed_at: Time.current) }

    it "cannot be voted in from here" do
      put "/api/v1/seasons/#{season_of(other).id}/votes",
        params: { season_title_id: pernilongo.id, voter_id: ana.id, votee_id: bruno.id }, headers: headers

      expect(response).to have_http_status(:not_found)
    end

    it "never shows its votes here" do
      vote!

      get "/api/v1/season_title_votes", headers: headers_for(other)

      expect(json_body).to eq([])
    end

    it "asks for the colmeia" do
      get "/api/v1/seasons/#{season.id}/votes"

      expect(response).to have_http_status(:unauthorized)
    end
  end
end
