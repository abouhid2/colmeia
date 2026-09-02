require "rails_helper"

RSpec.describe Tasks::Complete do
  let(:household) { Household.create!(name: "Casa") }
  let(:member) { household.members.create!(name: "Ana") }
  let(:lagartinha) { household.members.create!(name: "Duda", kind: "lagartinha") }
  let(:now) { Time.zone.local(2026, 3, 10, 15, 0) }

  it "closes a one-off task and awards full points right away" do
    task = household.tasks.create!(title: "Pendurar quadro", points: 15)

    result = described_class.new(task: task, member: member, now: now).call

    expect(result.task).to be_done
    expect(result.task.completed_at).to eq(now)
    expect(result.completion).to have_attributes(status: "approved", points_awarded: 15, member: member, task_points: 15)
    expect(result.completion.household_id).to eq(household.id)
  end

  it "keeps a recurring task open and rolls the due date from the completion day" do
    task = household.tasks.create!(title: "Limpar banheiro", points: 20, recurrence: "weekly", due_on: Date.new(2026, 3, 8))

    result = described_class.new(task: task, member: member, now: now).call

    expect(result.task.status).to eq("open")
    expect(result.task.due_on).to eq(Date.new(2026, 3, 17))
  end

  it "creates a pending, zero-point completion when the task requires review" do
    task = household.tasks.create!(title: "Trocar resistência", points: 50, requires_review: true)

    result = described_class.new(task: task, member: member, now: now).call

    expect(result.completion).to have_attributes(status: "pending", points_awarded: 0, task_points: 50)
  end

  it "multiplies the points a lagartinha earns and records the multiplier used" do
    task = household.tasks.create!(title: "Lavar a louça", points: 5)

    result = described_class.new(task: task, member: lagartinha, now: now).call

    expect(result.completion).to have_attributes(points_awarded: 8, task_points: 5, multiplier: 1.5)
  end

  it "leaves a reviewed completion at zero points but keeps the multiplier for later" do
    task = household.tasks.create!(title: "Trocar a roupa de cama", points: 10, requires_review: true)

    result = described_class.new(task: task, member: lagartinha, now: now).call

    expect(result.completion).to have_attributes(status: "pending", points_awarded: 0, multiplier: 1.5)
  end

  it "refuses to complete a task that is already done" do
    task = household.tasks.create!(title: "Feito", points: 5, status: "done")

    expect { described_class.new(task: task, member: member).call }.to raise_error(described_class::AlreadyDone)
    expect(Completion.count).to eq(0)
  end

  it "refuses a member from another colmeia" do
    task = household.tasks.create!(title: "Louça", points: 5)
    stranger = Household.create!(name: "Outra").members.create!(name: "Estranho")

    expect { described_class.new(task: task, member: stranger).call }.to raise_error(ActiveRecord::RecordNotFound)
    expect(Completion.count).to eq(0)
  end
end
