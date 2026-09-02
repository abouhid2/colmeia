require "rails_helper"

RSpec.describe "Tasks API", type: :request do
  let(:household) { create_household }
  let(:headers) { headers_for(household) }
  let!(:member) { household.members.create!(name: "Ana") }

  describe "GET /api/v1/tasks" do
    it "lists tasks, optionally filtered by status" do
      household.tasks.create!(title: "Aberta", points: 5)
      household.tasks.create!(title: "Feita", points: 5, status: "done")

      get "/api/v1/tasks", params: { status: "open" }, headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_body.map { |task| task["title"] }).to eq([ "Aberta" ])
    end
  end

  describe "POST /api/v1/tasks" do
    it "creates a task" do
      post "/api/v1/tasks", params: { task: { title: "Regar", points: 5, recurrence: "custom", interval_days: 3, assignee_id: member.id } }, headers: headers

      expect(response).to have_http_status(:created)
      expect(json_body).to include("title" => "Regar", "recurrence" => "custom", "interval_days" => 3, "assignee_id" => member.id)
    end

    it "returns validation errors" do
      post "/api/v1/tasks", params: { task: { title: "", points: 0 } }, headers: headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_body["details"]).to include("Título não pode ficar em branco")
    end
  end

  describe "POST /api/v1/tasks with a member that no longer exists" do
    it "answers 422 in Portuguese instead of crashing" do
      post "/api/v1/tasks", params: { task: { title: "Órfã", points: 5, assignee_id: 999_999 } }, headers: headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_body["details"].first).to include("não existe mais")
    end
  end

  describe "POST /api/v1/tasks/:id/reopen" do
    it "reopens a done task and clears completed_at" do
      task = household.tasks.create!(title: "Feita", points: 5, status: "done", completed_at: Time.current)

      post "/api/v1/tasks/#{task.id}/reopen", headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_body).to include("status" => "open", "completed_at" => nil)
    end

    it "takes back the completion that closed the task, so it pays only once" do
      task = household.tasks.create!(title: "Pendurar quadro", points: 15)
      post "/api/v1/tasks/#{task.id}/complete", params: { member_id: member.id }, headers: headers

      post "/api/v1/tasks/#{task.id}/reopen", headers: headers
      expect(response).to have_http_status(:ok)
      expect(household.completions.count).to eq(0)

      post "/api/v1/tasks/#{task.id}/complete", params: { member_id: member.id }, headers: headers

      expect(household.completions.approved.count).to eq(1)
      expect(household.completions.sum(:points_awarded)).to eq(15)
    end

    it "answers 409 when the task is already open" do
      task = household.tasks.create!(title: "Aberta", points: 5)

      post "/api/v1/tasks/#{task.id}/reopen", headers: headers

      expect(response).to have_http_status(:conflict)
    end

    it "ignores status through mass assignment" do
      task = household.tasks.create!(title: "Aberta", points: 5)

      patch "/api/v1/tasks/#{task.id}", params: { task: { status: "done" } }, headers: headers

      expect(task.reload.status).to eq("open")
    end
  end

  describe "POST /api/v1/tasks/:id/complete" do
    it "returns the updated task and the new completion" do
      task = household.tasks.create!(title: "Louça", points: 5, recurrence: "daily", due_on: Date.current)

      post "/api/v1/tasks/#{task.id}/complete", params: { member_id: member.id }, headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_body.dig("task", "due_on")).to eq((Date.current + 1).iso8601)
      expect(json_body.dig("completion", "points_awarded")).to eq(5)
    end

    it "responds with 409 when the task is already done" do
      task = household.tasks.create!(title: "Feita", points: 5, status: "done")

      post "/api/v1/tasks/#{task.id}/complete", params: { member_id: member.id }, headers: headers

      expect(response).to have_http_status(:conflict)
    end
  end
end
