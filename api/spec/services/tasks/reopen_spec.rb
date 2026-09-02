require "rails_helper"

RSpec.describe Tasks::Reopen do
  let(:household) { Household.create!(name: "Casa") }
  let(:member) { household.members.create!(name: "Ana") }
  let(:now) { Time.zone.local(2026, 3, 10, 15, 0) }

  it "opens the task again and takes back the completion that closed it" do
    task = household.tasks.create!(title: "Pendurar quadro", points: 15)
    Tasks::Complete.new(task: task, member: member, now: now).call

    reopened = described_class.new(task: task).call

    expect(reopened).not_to be_done
    expect(reopened.completed_at).to be_nil
    expect(household.completions.count).to eq(0)
  end

  it "keeps the completions of the times before this one" do
    task = household.tasks.create!(title: "Pendurar quadro", points: 15)
    older = household.completions.create!(task: task, member: member, status: "approved", points_awarded: 15,
      task_title: task.title, task_points: 15, completed_at: now - 2.days)
    Tasks::Complete.new(task: task, member: member, now: now).call

    described_class.new(task: task).call

    expect(household.completions.pluck(:id)).to eq([ older.id ])
  end

  it "refuses a task that is already open" do
    task = household.tasks.create!(title: "Aberta", points: 5)

    expect { described_class.new(task: task).call }.to raise_error(described_class::AlreadyOpen)
  end
end
