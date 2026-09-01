require "rails_helper"

RSpec.describe Tasks::Complete do
  let(:member) { Member.create!(name: "Ana") }
  let(:now) { Time.zone.local(2026, 3, 10, 15, 0) }

  it "closes a one-off task and awards full points right away" do
    task = Task.create!(title: "Pendurar quadro", points: 15)

    result = described_class.new(task: task, member: member, now: now).call

    expect(result.task).to be_done
    expect(result.task.completed_at).to eq(now)
    expect(result.completion).to have_attributes(status: "approved", points_awarded: 15, member: member, task_points: 15)
  end

  it "keeps a recurring task open and rolls the due date from the completion day" do
    task = Task.create!(title: "Limpar banheiro", points: 20, recurrence: "weekly", due_on: Date.new(2026, 3, 8))

    result = described_class.new(task: task, member: member, now: now).call

    expect(result.task.status).to eq("open")
    expect(result.task.due_on).to eq(Date.new(2026, 3, 17))
  end

  it "creates a pending, zero-point completion when the task requires review" do
    task = Task.create!(title: "Trocar resistência", points: 50, requires_review: true)

    result = described_class.new(task: task, member: member, now: now).call

    expect(result.completion).to have_attributes(status: "pending", points_awarded: 0, task_points: 50)
  end

  it "refuses to complete a task that is already done" do
    task = Task.create!(title: "Feito", points: 5, status: "done")

    expect { described_class.new(task: task, member: member).call }.to raise_error(described_class::AlreadyDone)
    expect(Completion.count).to eq(0)
  end
end
