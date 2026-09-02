require "rails_helper"

RSpec.describe Tasks::Complete do
  let(:household) { Household.create!(name: "Casa") }
  let(:season) { household.seasons.create!(name: "Estação atual", starts_on: Date.new(2026, 3, 1)) }
  # An estação running longer than the backdating limit, so the one-year bound
  # is the one that bites instead of the estação's own start.
  let(:old_season) { household.seasons.create!(name: "Estação longa", starts_on: Date.new(2024, 1, 1)) }
  let(:member) { household.members.create!(name: "Ana") }
  let(:lagartinha) { household.members.create!(name: "Duda", kind: "lagartinha") }
  let(:now) { Time.zone.local(2026, 3, 10, 15, 0) }

  it "closes a one-off task and awards full points right away" do
    task = household.tasks.create!(season: season, title: "Pendurar quadro", points: 15)

    result = described_class.new(task: task, member: member, now: now).call

    expect(result.task).to be_done
    expect(result.task.completed_at).to eq(now)
    expect(result.completion).to have_attributes(status: "approved", points_awarded: 15, member: member, task_points: 15)
    expect(result.completion.household_id).to eq(household.id)
    expect(result.completion.season_id).to eq(season.id)
  end

  it "keeps a recurring task open and rolls the due date from the completion day" do
    task = household.tasks.create!(season: season, title: "Limpar banheiro", points: 20, recurrence: "weekly", due_on: Date.new(2026, 3, 8))

    result = described_class.new(task: task, member: member, now: now).call

    expect(result.task.status).to eq("open")
    expect(result.task.due_on).to eq(Date.new(2026, 3, 17))
  end

  it "creates a pending, zero-point completion when the task requires review" do
    task = household.tasks.create!(season: season, title: "Trocar resistência", points: 50, requires_review: true)

    result = described_class.new(task: task, member: member, now: now).call

    expect(result.completion).to have_attributes(status: "pending", points_awarded: 0, task_points: 50)
  end

  it "multiplies the points a lagartinha earns and records the multiplier used" do
    task = household.tasks.create!(season: season, title: "Lavar a louça", points: 5)

    result = described_class.new(task: task, member: lagartinha, now: now).call

    expect(result.completion).to have_attributes(points_awarded: 8, task_points: 5, multiplier: 1.5)
  end

  it "leaves a reviewed completion at zero points but keeps the multiplier for later" do
    task = household.tasks.create!(season: season, title: "Trocar a roupa de cama", points: 10, requires_review: true)

    result = described_class.new(task: task, member: lagartinha, now: now).call

    expect(result.completion).to have_attributes(status: "pending", points_awarded: 0, multiplier: 1.5)
  end

  it "refuses to complete a task that is already done" do
    task = household.tasks.create!(season: season, title: "Feito", points: 5, status: "done")

    expect { described_class.new(task: task, member: member).call }.to raise_error(described_class::AlreadyDone)
    expect(Completion.count).to eq(0)
  end

  it "refuses a member from another colmeia" do
    task = household.tasks.create!(season: season, title: "Louça", points: 5)
    stranger = Household.create!(name: "Outra").members.create!(name: "Estranho")

    expect { described_class.new(task: task, member: stranger).call }.to raise_error(ActiveRecord::RecordNotFound)
    expect(Completion.count).to eq(0)
  end

  describe "a completion registered after the fact" do
    let(:yesterday) { Time.zone.local(2026, 3, 9, 18, 30) }

    def complete(task, at, member: self.member)
      described_class.new(task: task, member: member, completed_at: at, now: now).call
    end

    it "closes a one-off task on the day the work happened, not today" do
      task = household.tasks.create!(season: season, title: "Pendurar quadro", points: 15)

      result = complete(task, yesterday.iso8601)

      expect(result.completion.completed_at).to eq(yesterday)
      expect(result.task.completed_at).to eq(yesterday)
      expect(result.task).to be_done
    end

    it "accepts a Time as readily as an ISO string" do
      task = household.tasks.create!(season: season, title: "Pendurar quadro", points: 15)

      expect(complete(task, yesterday).completion.completed_at).to eq(yesterday)
    end

    it "falls back to now when the moment is blank" do
      task = household.tasks.create!(season: season, title: "Pendurar quadro", points: 15)

      expect(complete(task, "").completion.completed_at).to eq(now)
    end

    it "rolls a recurring task forward from the day the work happened" do
      task = household.tasks.create!(season: season, title: "Limpar banheiro", points: 20, recurrence: "weekly", due_on: Date.new(2026, 3, 8))

      result = complete(task, yesterday.iso8601)

      expect(result.task.status).to eq("open")
      expect(result.task.due_on).to eq(Date.new(2026, 3, 16))
    end

    it "keeps the due date when the completion belongs to a cycle already closed" do
      # A long estação, so the moment stays inside it and the due date is what is under test.
      task = household.tasks.create!(season: old_season, title: "Limpar banheiro", points: 20, recurrence: "weekly", due_on: Date.new(2026, 3, 20))

      result = complete(task, Time.zone.local(2026, 2, 1, 10, 0).iso8601)

      expect(result.task.due_on).to eq(Date.new(2026, 3, 20))
      expect(result.completion.completed_at).to eq(Time.zone.local(2026, 2, 1, 10, 0))
    end

    it "sets a due date on a recurring task that never had one" do
      task = household.tasks.create!(season: season, title: "Regar as plantas", points: 5, recurrence: "daily")

      expect(complete(task, yesterday.iso8601).task.due_on).to eq(Date.new(2026, 3, 10))
    end

    it "leaves a reviewed task pending, dated when the work happened" do
      task = household.tasks.create!(season: season, title: "Trocar resistência", points: 50, requires_review: true)

      result = complete(task, yesterday.iso8601)

      expect(result.completion).to have_attributes(status: "pending", points_awarded: 0)
      expect(result.completion.completed_at).to eq(yesterday)
    end

    it "refuses a moment in the future" do
      task = household.tasks.create!(season: season, title: "Louça", points: 5)

      expect { complete(task, (now + 1.hour).iso8601) }
        .to raise_error(described_class::InvalidMoment, "Essa data está no futuro")
      expect(Completion.count).to eq(0)
    end

    it "tolerates a clock a minute ahead of the server's" do
      task = household.tasks.create!(season: season, title: "Louça", points: 5)

      expect(complete(task, (now + 1.minute).iso8601).completion.completed_at).to eq(now + 1.minute)
    end

    it "refuses a moment from before the estação opened" do
      task = household.tasks.create!(season: season, title: "Louça", points: 5)

      expect { complete(task, Time.zone.local(2026, 2, 28, 20, 0).iso8601) }
        .to raise_error(described_class::InvalidMoment, "Essa data é de antes da estação começar")
      expect(Completion.count).to eq(0)
    end

    it "accepts a moment from the very day the estação opened" do
      task = household.tasks.create!(season: season, title: "Louça", points: 5)
      opening_day = Time.zone.local(2026, 3, 1, 9, 0)

      expect(complete(task, opening_day.iso8601).completion.completed_at).to eq(opening_day)
    end

    it "names the estação, not the year, when the date is outside both" do
      task = household.tasks.create!(season: season, title: "Louça", points: 5)

      expect { complete(task, (now - 400.days).iso8601) }
        .to raise_error(described_class::InvalidMoment, "Essa data é de antes da estação começar")
    end

    it "refuses a moment more than a year back, even in an estação that old" do
      task = household.tasks.create!(season: old_season, title: "Louça", points: 5)

      expect { complete(task, (now - 366.days).iso8601) }
        .to raise_error(described_class::InvalidMoment, "Só dá para registrar até um ano atrás")
      expect(Completion.count).to eq(0)
    end

    it "accepts a moment exactly a year back" do
      task = household.tasks.create!(season: old_season, title: "Louça", points: 5)

      expect(complete(task, (now - 365.days).iso8601).completion.completed_at).to eq(now - 365.days)
    end

    it "refuses a moment it cannot read" do
      task = household.tasks.create!(season: season, title: "Louça", points: 5)

      expect { complete(task, "ontem à noite") }
        .to raise_error(described_class::InvalidMoment, "Não deu para entender essa data")
      expect { complete(task, "2026-13-45T99:00:00") }
        .to raise_error(described_class::InvalidMoment, "Não deu para entender essa data")
      expect(Completion.count).to eq(0)
    end
  end
end
