require "rails_helper"

RSpec.describe "Tasks API", type: :request do
  let(:household) { create_household }
  let(:headers) { headers_for(household) }
  let(:season) { season_of(household) }
  let!(:member) { household.members.create!(name: "Ana") }

  describe "GET /api/v1/tasks" do
    it "lists tasks, optionally filtered by status" do
      household.tasks.create!(season: season, title: "Aberta", points: 5)
      household.tasks.create!(season: season, title: "Feita", points: 5, status: "done")

      get "/api/v1/tasks", params: { status: "open" }, headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_body.map { |task| task["title"] }).to eq([ "Aberta" ])
    end
  end

  describe "POST /api/v1/tasks" do
    it "creates a task" do
      post "/api/v1/tasks", params: { task: { title: "Regar", points: 5, recurrence: "custom", interval_days: 3, assignee_ids: [ member.id ], season_id: season.id } }, headers: headers

      expect(response).to have_http_status(:created)
      expect(json_body).to include("title" => "Regar", "recurrence" => "custom", "interval_days" => 3, "assignee_ids" => [ member.id ])
    end

    it "marks a task as good for lagartinhas" do
      post "/api/v1/tasks", params: { task: { title: "Regar", points: 5, kid_friendly: true, season_id: season.id } }, headers: headers

      expect(json_body).to include("kid_friendly" => true)
    end

    it "creates a task that repeats on chosen days of the week" do
      post "/api/v1/tasks", params: { task: { title: "Lixo", points: 5, recurrence: "weekdays", weekdays: [ 4, 2 ], season_id: season.id } }, headers: headers

      expect(response).to have_http_status(:created)
      expect(json_body).to include("recurrence" => "weekdays", "weekdays" => [ 2, 4 ])
    end

    it "refuses weekday recurrence with no day" do
      post "/api/v1/tasks", params: { task: { title: "Lixo", points: 5, recurrence: "weekdays", season_id: season.id } }, headers: headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_body["details"]).to include("Dias da semana precisam de pelo menos um dia")
    end

    it "shares a task between more than one person" do
      bruno = household.members.create!(name: "Bruno")

      post "/api/v1/tasks", params: { task: { title: "Arrumar a garagem", points: 5, assignee_ids: [ bruno.id, member.id ], season_id: season.id } }, headers: headers

      expect(response).to have_http_status(:created)
      expect(json_body["assignee_ids"]).to eq([ member.id, bruno.id ].sort)
    end

    it "returns validation errors" do
      post "/api/v1/tasks", params: { task: { title: "", points: 0, season_id: season.id } }, headers: headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_body["details"]).to include("Título não pode ficar em branco")
    end
  end

  describe "POST /api/v1/tasks with a member that no longer exists" do
    it "answers 422 in Portuguese instead of crashing" do
      post "/api/v1/tasks", params: { task: { title: "Órfã", points: 5, assignee_ids: [ 999_999 ], season_id: season.id } }, headers: headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_body["details"]).to eq([ "Escolha só quem mora nesta colmeia" ])
    end
  end

  describe "POST /api/v1/tasks/:id/reopen" do
    it "reopens a done task and clears completed_at" do
      task = household.tasks.create!(season: season, title: "Feita", points: 5, status: "done", completed_at: Time.current)

      post "/api/v1/tasks/#{task.id}/reopen", headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_body).to include("status" => "open", "completed_at" => nil)
    end

    it "takes back the completion that closed the task, so it pays only once" do
      task = household.tasks.create!(season: season, title: "Pendurar quadro", points: 15)
      post "/api/v1/tasks/#{task.id}/complete", params: { member_id: member.id }, headers: headers

      post "/api/v1/tasks/#{task.id}/reopen", headers: headers
      expect(response).to have_http_status(:ok)
      expect(household.completions.count).to eq(0)

      post "/api/v1/tasks/#{task.id}/complete", params: { member_id: member.id }, headers: headers

      expect(household.completions.approved.count).to eq(1)
      expect(household.completions.sum(:points_awarded)).to eq(15)
    end

    it "answers 409 for a task of a closed estação, so its history keeps the completion" do
      task = household.tasks.create!(season: season, title: "Pendurar quadro", points: 15)
      post "/api/v1/tasks/#{task.id}/complete", params: { member_id: member.id }, headers: headers
      season.update!(closed_at: Time.current)

      post "/api/v1/tasks/#{task.id}/reopen", headers: headers

      expect(response).to have_http_status(:conflict)
      expect(json_body["details"]).to eq([ "Essa estação já foi encerrada" ])
      expect(task.reload.status).to eq("done")
      expect(household.completions.count).to eq(1)
    end

    it "answers 409 when the task is already open" do
      task = household.tasks.create!(season: season, title: "Aberta", points: 5)

      post "/api/v1/tasks/#{task.id}/reopen", headers: headers

      expect(response).to have_http_status(:conflict)
    end

    it "ignores status through mass assignment" do
      task = household.tasks.create!(season: season, title: "Aberta", points: 5)

      patch "/api/v1/tasks/#{task.id}", params: { task: { status: "done" } }, headers: headers

      expect(task.reload.status).to eq("open")
    end
  end

  describe "POST /api/v1/tasks/:id/complete" do
    it "returns the updated task and the new completion" do
      task = household.tasks.create!(season: season, title: "Louça", points: 5, recurrence: "daily", due_on: Date.current)

      post "/api/v1/tasks/#{task.id}/complete", params: { member_id: member.id }, headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_body.dig("task", "due_on")).to eq((Date.current + 1).iso8601)
      expect(json_body.dig("completion", "points_awarded")).to eq(5)
    end

    it "pays a lagartinha the multiplied points and reports the multiplier used" do
      duda = household.members.create!(name: "Duda", kind: "lagartinha")
      task = household.tasks.create!(season: season, title: "Louça", points: 5, kid_friendly: true)

      post "/api/v1/tasks/#{task.id}/complete", params: { member_id: duda.id }, headers: headers

      expect(json_body.dig("completion", "points_awarded")).to eq(8)
      expect(json_body.dig("completion", "multiplier")).to eq(1.5)
    end

    it "responds with 409 when the task is already done" do
      task = household.tasks.create!(season: season, title: "Feita", points: 5, status: "done")

      post "/api/v1/tasks/#{task.id}/complete", params: { member_id: member.id }, headers: headers

      expect(response).to have_http_status(:conflict)
    end

    it "dates the completion when the work happened, if the request says so" do
      season.update!(starts_on: 30.days.ago.to_date)
      task = household.tasks.create!(season: season, title: "Pendurar quadro", points: 15)
      done_at = 3.days.ago.change(usec: 0)

      post "/api/v1/tasks/#{task.id}/complete",
        params: { member_id: member.id, completed_at: done_at.iso8601 }, headers: headers

      expect(response).to have_http_status(:ok)
      expect(Time.zone.parse(json_body.dig("completion", "completed_at"))).to eq(done_at)
      expect(Time.zone.parse(json_body.dig("task", "completed_at"))).to eq(done_at)
      expect(json_body.dig("completion", "season_id")).to eq(season.id)
    end

    it "responds with 422 when the moment is from before the estação started" do
      task = household.tasks.create!(season: season, title: "Louça", points: 5)

      post "/api/v1/tasks/#{task.id}/complete",
        params: { member_id: member.id, completed_at: 3.days.ago.iso8601 }, headers: headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_body["details"]).to eq([ "Essa data é de antes da estação começar" ])
      expect(household.completions.count).to eq(0)
    end

    it "responds with 422 and says why when the moment is in the future" do
      task = household.tasks.create!(season: season, title: "Louça", points: 5)

      post "/api/v1/tasks/#{task.id}/complete",
        params: { member_id: member.id, completed_at: 1.day.from_now.iso8601 }, headers: headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_body["details"]).to eq([ "Essa data está no futuro" ])
      expect(household.completions.count).to eq(0)
    end

    it "responds with 422 when the moment is more than a year back" do
      season.update!(starts_on: 500.days.ago.to_date)
      task = household.tasks.create!(season: season, title: "Louça", points: 5)

      post "/api/v1/tasks/#{task.id}/complete",
        params: { member_id: member.id, completed_at: 400.days.ago.iso8601 }, headers: headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_body["details"]).to eq([ "Só dá para registrar até um ano atrás" ])
    end
  end
end
