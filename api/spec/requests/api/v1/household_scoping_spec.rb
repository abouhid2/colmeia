require "rails_helper"

RSpec.describe "Household scoping", type: :request do
  let(:house) { create_household(name: "Nossa casa") }
  let(:other) { create_household(name: "Casa alheia") }
  let(:headers) { headers_for(house) }
  let(:season) { season_of(house) }
  let(:other_season) { season_of(other) }

  describe "the X-Household-Code header" do
    it "is required by every scoped endpoint" do
      %w[ /api/v1/household /api/v1/members /api/v1/tasks /api/v1/completions /api/v1/shopping_items /api/v1/goals /api/v1/seasons ].each do |path|
        get path

        expect(response).to have_http_status(:unauthorized), "expected 401 from #{path}"
        expect(json_body).to eq("error" => "unauthorized")
      end
    end

    it "rejects a code nobody owns" do
      get "/api/v1/tasks", headers: { "X-Household-Code" => "naoexiste" }

      expect(response).to have_http_status(:unauthorized)
    end

    it "finds the colmeia however the code was typed" do
      get "/api/v1/household", headers: { "X-Household-Code" => house.invite_code.upcase }

      expect(response).to have_http_status(:ok)
      expect(json_body["id"]).to eq(house.id)
    end

    it "rejects a blank code" do
      get "/api/v1/tasks", headers: { "X-Household-Code" => "" }

      expect(response).to have_http_status(:unauthorized)
    end

    it "is required to write, not only to read" do
      post "/api/v1/tasks", params: { task: { title: "Invadir", points: 5 } }

      expect(response).to have_http_status(:unauthorized)
      expect(Task.count).to eq(0)
    end
  end

  describe "GET /api/v1/household" do
    it "returns the colmeia behind the code" do
      get "/api/v1/household", headers: headers

      expect(json_body).to eq("id" => house.id, "name" => "Nossa casa", "invite_code" => house.invite_code, "demo" => false)
    end

    it "renames it" do
      patch "/api/v1/household", params: { household: { name: "Apê 42" } }, headers: headers

      expect(json_body["name"]).to eq("Apê 42")
      expect(other.reload.name).to eq("Casa alheia")
    end
  end

  describe "POST /api/v1/household/reseed" do
    it "puts a sandbox colmeia back the way it was handed out" do
      sandbox, = Households::SeedExample.create_household
      sandbox.tasks.destroy_all
      sandbox.members.find_by!(name: "Bruno").update!(name: "Estraguei tudo")

      post "/api/v1/household/reseed", headers: headers_for(sandbox)

      expect(response).to have_http_status(:ok)
      expect(json_body).to include("name" => Households::SeedExample::ENTRY_MEMBER_NAME, "claimed" => true)
      expect(sandbox.members.reload.pluck(:name)).to eq(%w[ Ana Bruno Clara Duda ])
      expect(sandbox.tasks.count).to eq(12)
    end

    it "answers with the member to carry on as, because the old ids are gone" do
      sandbox, ana = Households::SeedExample.create_household

      post "/api/v1/household/reseed", headers: headers_for(sandbox)

      expect(json_body["id"]).not_to eq(ana.id)
      expect(Member.find_by(id: ana.id)).to be_nil
      expect(sandbox.members.find(json_body["id"]).name).to eq("Ana")
    end

    it "refuses a colmeia somebody actually lives in" do
      house.tasks.create!(season: season, title: "Louça", points: 5)

      post "/api/v1/household/reseed", headers: headers

      expect(response).to have_http_status(:conflict)
      expect(json_body["details"]).to eq([ "Só uma colmeia de exemplo pode ser recomeçada." ])
      expect(house.tasks.count).to eq(1)
    end

    it "needs the header like every other scoped endpoint" do
      post "/api/v1/household/reseed"

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "reading" do
    before do
      other.members.create!(name: "Estranho")
      other.tasks.create!(season: other_season, title: "Tarefa alheia", points: 5)
      other.goals.create!(season: other_season, title: "Meta alheia", target_points: 50)
      other.shopping_items.create!(name: "Item alheio")
      other.completions.create!(season: other_season, task_title: "Feito alheio", task_points: 5, points_awarded: 5, completed_at: Time.current)
    end

    it "never leaks another colmeia's records" do
      { "/api/v1/members" => "name", "/api/v1/tasks" => "title", "/api/v1/goals" => "title",
        "/api/v1/shopping_items" => "name", "/api/v1/completions" => "task_title" }.each do |path, _field|
        get path, headers: headers

        expect(response).to have_http_status(:ok), "expected 200 from #{path}"
        expect(json_body).to eq([]), "expected #{path} to be empty"
      end
    end
  end

  describe "writing" do
    it "cannot read, edit or delete another colmeia's task" do
      task = other.tasks.create!(season: other_season, title: "Tarefa alheia", points: 5)

      patch "/api/v1/tasks/#{task.id}", params: { task: { title: "Sequestrada" } }, headers: headers
      expect(response).to have_http_status(:not_found)

      delete "/api/v1/tasks/#{task.id}", headers: headers
      expect(response).to have_http_status(:not_found)
      expect(task.reload.title).to eq("Tarefa alheia")
    end

    it "cannot edit or delete another colmeia's member" do
      member = other.members.create!(name: "Estranho")

      patch "/api/v1/members/#{member.id}", params: { member: { name: "Roubado" } }, headers: headers
      expect(response).to have_http_status(:not_found)

      delete "/api/v1/members/#{member.id}", headers: headers
      expect(response).to have_http_status(:not_found)
      expect(member.reload.name).to eq("Estranho")
    end

    it "cannot delete another colmeia's goal" do
      goal = other.goals.create!(season: other_season, title: "Meta alheia", target_points: 50)

      delete "/api/v1/goals/#{goal.id}", headers: headers

      expect(response).to have_http_status(:not_found)
      expect(goal.reload).to be_present
    end

    it "cannot clear another colmeia's shopping list" do
      other.shopping_items.create!(name: "Comprado alheio", purchased: true)

      delete "/api/v1/shopping_items/purchased", headers: headers

      expect(response).to have_http_status(:no_content)
      expect(other.shopping_items.count).to eq(1)
    end

    it "cannot assign a task to someone from another colmeia" do
      stranger = other.members.create!(name: "Estranho")

      post "/api/v1/tasks", params: { task: { title: "Louça", points: 5, assignee_id: stranger.id, season_id: season.id } }, headers: headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_body["details"]).to include(a_string_matching(/não é desta colmeia/))
    end

    it "cannot let an outsider complete a task" do
      task = house.tasks.create!(season: season, title: "Louça", points: 5)
      stranger = other.members.create!(name: "Estranho")

      post "/api/v1/tasks/#{task.id}/complete", params: { member_id: stranger.id }, headers: headers

      expect(response).to have_http_status(:not_found)
      expect(Completion.count).to eq(0)
    end

    it "cannot let an outsider review a completion" do
      worker = house.members.create!(name: "Ana")
      completion = house.completions.create!(season: season, member: worker, status: "pending", task_title: "Banheiro", task_points: 20, completed_at: Time.current)
      stranger = other.members.create!(name: "Estranho")

      post "/api/v1/completions/#{completion.id}/review", params: { reviewer_id: stranger.id, rating: 5 }, headers: headers

      expect(response).to have_http_status(:not_found)
      expect(completion.reload).to be_pending
    end
  end
end
