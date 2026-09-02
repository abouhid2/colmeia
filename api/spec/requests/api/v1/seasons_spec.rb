require "rails_helper"

RSpec.describe "Seasons API", type: :request do
  let(:household) { create_household }
  let(:headers) { headers_for(household) }
  let(:season) { season_of(household) }
  let!(:member) { household.members.create!(name: "Ana") }

  describe "GET /api/v1/seasons" do
    it "lists the estações of the colmeia, newest first, with what they hold" do
      household.seasons.create!(name: "Estação passada", starts_on: Date.current - 30, ends_on: Date.current - 8)
      household.tasks.create!(season: season, title: "Louça", points: 5)

      get "/api/v1/seasons", headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_body.map { |item| item["name"] }).to eq([ "Primeira estação", "Estação passada" ])
      expect(json_body.first).to include("tasks_count" => 1, "completions_count" => 0, "closed_at" => nil)
    end
  end

  describe "POST /api/v1/seasons" do
    it "opens an estação" do
      post "/api/v1/seasons", params: { season: { name: "Estação do verão", starts_on: "2026-12-01", ends_on: "2027-02-28" } }, headers: headers

      expect(response).to have_http_status(:created)
      expect(json_body).to include("name" => "Estação do verão", "starts_on" => "2026-12-01", "ends_on" => "2027-02-28")
    end

    it "leaves the end open when nobody sets one" do
      post "/api/v1/seasons", params: { season: { name: "Sem fim", starts_on: "2026-12-01" } }, headers: headers

      expect(json_body["ends_on"]).to be_nil
    end

    it "refuses an end before the start" do
      post "/api/v1/seasons", params: { season: { name: "Invertida", starts_on: "2026-12-01", ends_on: "2026-11-01" } }, headers: headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_body["details"].first).to include("não pode ser antes do começo")
    end

    it "refuses a nameless estação" do
      post "/api/v1/seasons", params: { season: { name: "  ", starts_on: "2026-12-01" } }, headers: headers

      expect(response).to have_http_status(:unprocessable_content)
    end

    it "reuses the open tasks of another estação, without their history" do
      household.tasks.create!(
        season: season, title: "Limpar o banheiro", points: 20, priority: "high", recurrence: "weekly",
        interval_days: nil, due_on: Date.current, requires_review: true, assignee: member, created_by: member
      )
      household.tasks.create!(season: season, title: "Já feita", points: 5, status: "done", completed_at: Time.current)

      post "/api/v1/seasons",
        params: { season: { name: "Nova", starts_on: Date.current.iso8601, copy_tasks_from_season_id: season.id } },
        headers: headers

      expect(response).to have_http_status(:created)
      copied = household.seasons.find(json_body["id"]).tasks
      expect(copied.map(&:title)).to eq([ "Limpar o banheiro" ])
      expect(copied.first).to have_attributes(
        points: 20, priority: "high", recurrence: "weekly", requires_review: true,
        assignee_id: member.id, created_by_id: member.id, due_on: nil, status: "open"
      )
    end

    it "cannot reuse the tasks of another colmeia" do
      other = create_household(name: "Casa alheia")
      other.tasks.create!(season: season_of(other), title: "Tarefa alheia", points: 5)

      post "/api/v1/seasons",
        params: { season: { name: "Nova", starts_on: Date.current.iso8601, copy_tasks_from_season_id: season_of(other).id } },
        headers: headers

      expect(response).to have_http_status(:not_found)
      expect(household.seasons.count).to eq(1)
    end
  end

  describe "PATCH /api/v1/seasons/:id" do
    it "renames an estação and moves its dates" do
      patch "/api/v1/seasons/#{season.id}", params: { season: { name: "Outono", ends_on: "2026-12-31" } }, headers: headers

      expect(json_body).to include("name" => "Outono", "ends_on" => "2026-12-31")
    end

    it "cannot touch another colmeia's estação" do
      other = create_household(name: "Casa alheia")

      patch "/api/v1/seasons/#{season_of(other).id}", params: { season: { name: "Sequestrada" } }, headers: headers

      expect(response).to have_http_status(:not_found)
      expect(season_of(other).reload.name).to eq("Primeira estação")
    end
  end

  describe "POST /api/v1/seasons/:id/close and reopen" do
    it "closes an estação once and refuses the second time" do
      post "/api/v1/seasons/#{season.id}/close", headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_body["closed_at"]).to be_present

      post "/api/v1/seasons/#{season.id}/close", headers: headers
      expect(response).to have_http_status(:conflict)
    end

    it "reopens a closed estação and refuses to reopen an open one" do
      season.update!(closed_at: Time.current)

      post "/api/v1/seasons/#{season.id}/reopen", headers: headers
      expect(json_body["closed_at"]).to be_nil

      post "/api/v1/seasons/#{season.id}/reopen", headers: headers
      expect(response).to have_http_status(:conflict)
    end
  end

  describe "DELETE /api/v1/seasons/:id" do
    it "deletes an estação nobody scored in, taking its tasks and goals" do
      household.tasks.create!(season: season, title: "Louça", points: 5)
      household.goals.create!(season: season, title: "Pizza", target_points: 100)

      delete "/api/v1/seasons/#{season.id}", headers: headers

      expect(response).to have_http_status(:no_content)
      expect([ Season.count, Task.count, Goal.count ]).to eq([ 0, 0, 0 ])
    end

    it "keeps an estação that already has history" do
      household.completions.create!(season: season, task_title: "Louça", task_points: 5, points_awarded: 5, completed_at: Time.current)

      delete "/api/v1/seasons/#{season.id}", headers: headers

      expect(response).to have_http_status(:conflict)
      expect(json_body["details"].first).to include("não dá para apagá-la")
      expect(season.reload).to be_present
    end
  end

  describe "a closed estação" do
    before { season.update!(closed_at: Time.current) }

    it "takes no new task" do
      post "/api/v1/tasks", params: { task: { title: "Tarde demais", points: 5, season_id: season.id } }, headers: headers

      expect(response).to have_http_status(:conflict)
      expect(json_body["details"]).to eq([ "Essa estação já foi encerrada" ])
    end

    it "takes no new goal" do
      post "/api/v1/goals", params: { goal: { title: "Tarde demais", target_points: 50, season_id: season.id } }, headers: headers

      expect(response).to have_http_status(:conflict)
    end

    it "scores nothing more" do
      task = household.tasks.create!(season: season, title: "Louça", points: 5)
      season.update!(closed_at: Time.current)

      post "/api/v1/tasks/#{task.id}/complete", params: { member_id: member.id }, headers: headers

      expect(response).to have_http_status(:conflict)
      expect(Completion.count).to eq(0)
    end
  end

  describe "estações of another colmeia" do
    let(:other) { create_household(name: "Casa alheia") }

    it "never show up in the list" do
      other.seasons.create!(name: "Alheia", starts_on: Date.current)

      get "/api/v1/seasons", headers: headers

      expect(json_body.map { |item| item["name"] }).to eq([ "Primeira estação" ])
    end

    it "cannot hold this colmeia's tasks or goals" do
      post "/api/v1/tasks", params: { task: { title: "Louça", points: 5, season_id: season_of(other).id } }, headers: headers
      expect(response).to have_http_status(:unprocessable_content)
      expect(json_body["details"]).to include(a_string_matching(/não é desta colmeia/))

      post "/api/v1/goals", params: { goal: { title: "Pizza", target_points: 50, season_id: season_of(other).id } }, headers: headers
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "filtering by estação" do
    let!(:older) { household.seasons.create!(name: "Estação passada", starts_on: Date.current - 30, ends_on: Date.current - 8) }

    it "narrows tasks, goals and completions to one estação, and spans them all by default" do
      household.tasks.create!(season: season, title: "Atual", points: 5)
      household.tasks.create!(season: older, title: "Antiga", points: 5)
      household.goals.create!(season: season, title: "Pizza", target_points: 50)
      household.goals.create!(season: older, title: "Sorvete", target_points: 50)
      household.completions.create!(season: older, task_title: "Antiga", task_points: 5, points_awarded: 5, completed_at: Time.current)

      get "/api/v1/tasks", params: { season_id: season.id }, headers: headers
      expect(json_body.map { |task| task["title"] }).to eq([ "Atual" ])

      get "/api/v1/tasks", headers: headers
      expect(json_body.map { |task| task["title"] }).to contain_exactly("Atual", "Antiga")

      get "/api/v1/goals", params: { season_id: older.id }, headers: headers
      expect(json_body.map { |goal| goal["title"] }).to eq([ "Sorvete" ])

      get "/api/v1/completions", headers: headers
      expect(json_body.map { |completion| completion["season_id"] }).to eq([ older.id ])

      get "/api/v1/completions", params: { season_id: season.id }, headers: headers
      expect(json_body).to eq([])
    end
  end

  it "stamps the estação of the task on the completion it creates" do
    task = household.tasks.create!(season: season, title: "Louça", points: 5)

    post "/api/v1/tasks/#{task.id}/complete", params: { member_id: member.id }, headers: headers

    expect(json_body.dig("completion", "season_id")).to eq(season.id)
  end

  it "opens every new colmeia with one estação" do
    post "/api/v1/households", params: { household: { name: "Casa nova", member_names: [ "Ana" ] } }

    expect(response).to have_http_status(:created)
    expect(Household.find(json_body["id"]).seasons.pluck(:name, :ends_on)).to eq([ [ "Primeira estação", nil ] ])
  end
end
