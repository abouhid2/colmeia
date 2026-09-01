require "rails_helper"

RSpec.describe "Tasks API", type: :request do
  let!(:member) { Member.create!(name: "Ana") }

  describe "GET /api/v1/tasks" do
    it "lists tasks, optionally filtered by status" do
      Task.create!(title: "Aberta", points: 5)
      Task.create!(title: "Feita", points: 5, status: "done")

      get "/api/v1/tasks", params: { status: "open" }

      expect(response).to have_http_status(:ok)
      expect(json_body.map { |task| task["title"] }).to eq([ "Aberta" ])
    end
  end

  describe "POST /api/v1/tasks" do
    it "creates a task" do
      post "/api/v1/tasks", params: { task: { title: "Regar", points: 5, recurrence: "custom", interval_days: 3, assignee_id: member.id } }

      expect(response).to have_http_status(:created)
      expect(json_body).to include("title" => "Regar", "recurrence" => "custom", "interval_days" => 3, "assignee_id" => member.id)
    end

    it "returns validation errors" do
      post "/api/v1/tasks", params: { task: { title: "", points: 0 } }

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_body["details"]).to include("Title can't be blank")
    end
  end

  describe "POST /api/v1/tasks/:id/complete" do
    it "returns the updated task and the new completion" do
      task = Task.create!(title: "Louça", points: 5, recurrence: "daily", due_on: Date.current)

      post "/api/v1/tasks/#{task.id}/complete", params: { member_id: member.id }

      expect(response).to have_http_status(:ok)
      expect(json_body.dig("task", "due_on")).to eq((Date.current + 1).iso8601)
      expect(json_body.dig("completion", "points_awarded")).to eq(5)
    end

    it "responds with 409 when the task is already done" do
      task = Task.create!(title: "Feita", points: 5, status: "done")

      post "/api/v1/tasks/#{task.id}/complete", params: { member_id: member.id }

      expect(response).to have_http_status(:conflict)
    end
  end
end
