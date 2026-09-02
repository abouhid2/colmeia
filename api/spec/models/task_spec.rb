require "rails_helper"

RSpec.describe Task do
  describe "#next_due_on" do
    let(:from) { Date.new(2026, 1, 31) }

    it "is nil for one-off tasks" do
      expect(described_class.new(recurrence: "none").next_due_on(from)).to be_nil
    end

    it "adds a day for daily tasks" do
      expect(described_class.new(recurrence: "daily").next_due_on(from)).to eq(Date.new(2026, 2, 1))
    end

    it "adds a week for weekly tasks" do
      expect(described_class.new(recurrence: "weekly").next_due_on(from)).to eq(Date.new(2026, 2, 7))
    end

    it "jumps to the next chosen day of the week" do
      # 31 Jan 2026 is a Saturday: Tuesday and Thursday put it on 3 Feb.
      task = described_class.new(recurrence: "weekdays", weekdays: [ 2, 4 ])
      expect(task.next_due_on(from)).to eq(Date.new(2026, 2, 3))
    end

    it "comes back a week later when the only chosen day is the day it was done" do
      task = described_class.new(recurrence: "weekdays", weekdays: [ 6 ])
      expect(task.next_due_on(from)).to eq(Date.new(2026, 2, 7))
    end

    it "adds a calendar month for monthly tasks, clamping the day" do
      expect(described_class.new(recurrence: "monthly").next_due_on(from)).to eq(Date.new(2026, 2, 28))
    end

    it "adds the interval for custom tasks" do
      task = described_class.new(recurrence: "custom", interval_days: 3)
      expect(task.next_due_on(from)).to eq(Date.new(2026, 2, 3))
    end
  end

  describe "validations" do
    let(:household) { Household.create!(name: "Casa") }
    let(:season) { household.seasons.create!(name: "Estação", starts_on: Date.current) }

    it "is valid inside a colmeia and an estação" do
      expect(household.tasks.build(season: season, title: "Louça", points: 5)).to be_valid
    end

    it "requires a colmeia" do
      task = described_class.new(title: "Louça", points: 5)
      expect(task).not_to be_valid
      expect(task.errors[:household]).to be_present
    end

    it "requires an estação" do
      task = household.tasks.build(title: "Louça", points: 5)
      expect(task).not_to be_valid
      expect(task.errors[:season]).to be_present
    end

    it "rejects an estação from another colmeia" do
      stranger = Household.create!(name: "Outra").seasons.create!(name: "Alheia", starts_on: Date.current)
      task = household.tasks.build(season: stranger, title: "Louça", points: 5)

      expect(task).not_to be_valid
      expect(task.errors[:season]).to include("não é desta colmeia")
    end

    it "requires interval_days for custom recurrence" do
      task = household.tasks.build(season: season, title: "Regar", recurrence: "custom")
      expect(task).not_to be_valid
      expect(task.errors[:interval_days]).to be_present
    end

    it "requires at least one day for weekday recurrence" do
      task = household.tasks.build(season: season, title: "Lixo", recurrence: "weekdays")
      expect(task).not_to be_valid
      expect(task.errors[:weekdays]).to be_present
    end

    it "rejects a day that is not a day of the week" do
      task = household.tasks.build(season: season, title: "Lixo", recurrence: "weekdays", weekdays: [ 7 ])
      expect(task).not_to be_valid
      expect(task.errors[:weekdays]).to be_present
    end

    it "sorts the days and drops repeats" do
      task = household.tasks.create!(season: season, title: "Lixo", recurrence: "weekdays", weekdays: [ 4, 2, 4 ])
      expect(task.weekdays).to eq([ 2, 4 ])
    end

    it "forgets the days when the recurrence stops using them" do
      task = household.tasks.create!(season: season, title: "Lixo", recurrence: "weekdays", weekdays: [ 2 ])
      task.update!(recurrence: "weekly")
      expect(task.weekdays).to eq([])
    end

    it "loses a person who leaves the colmeia, and keeps the task" do
      ana = household.members.create!(name: "Ana")
      bruno = household.members.create!(name: "Bruno")
      task = household.tasks.create!(season: season, title: "Arrumar a garagem", points: 5, assignee_ids: [ ana.id, bruno.id ])

      ana.destroy!

      expect(task.reload.assignee_ids).to eq([ bruno.id ])
    end

    it "rejects zero points" do
      expect(household.tasks.build(season: season, title: "x", points: 0)).not_to be_valid
    end

    it "rejects unknown priorities" do
      expect(household.tasks.build(season: season, title: "x", priority: "meh")).not_to be_valid
    end

    it "rejects an assignee from another colmeia" do
      stranger = Household.create!(name: "Outra").members.create!(name: "Estranho")
      task = household.tasks.build(season: season, title: "Louça", points: 5, assignee_ids: [ stranger.id ])

      expect(task).not_to be_valid
      expect(task.errors[:base]).to include("Escolha só quem mora nesta colmeia")
    end

    it "takes more than one person on the same task" do
      ana = household.members.create!(name: "Ana")
      bruno = household.members.create!(name: "Bruno")
      task = household.tasks.create!(season: season, title: "Arrumar a garagem", points: 5, assignee_ids: [ bruno.id, ana.id ])

      expect(task.reload.assignee_ids).to eq([ ana.id, bruno.id ].sort)
      expect(task).to be_shared
    end
  end
end
