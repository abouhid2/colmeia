require "rails_helper"
require Rails.root.join("db/migrate/20260903000004_backfill_seasons")

RSpec.describe BackfillSeasons do
  # The migration runs against a database where nothing had an estação yet, so
  # the column has to be nullable again for these examples to build that state.
  around do |example|
    ActiveRecord::Migration.suppress_messages { described_class.new.down }
    example.run
  end

  def orphan(record)
    record.save!(validate: false)
    record
  end

  def migrate!
    ActiveRecord::Migration.suppress_messages { described_class.new.up }
  end

  it "opens one estação per colmeia and adopts everything it holds" do
    household = Household.create!(name: "Casa")
    task = orphan(household.tasks.build(title: "Louça", points: 5))
    goal = orphan(household.goals.build(title: "Pizza", target_points: 100))
    completion = orphan(household.completions.build(task_title: "Louça", task_points: 5, points_awarded: 5, completed_at: Time.current))

    migrate!

    season = household.seasons.sole
    expect(season).to have_attributes(name: "Primeira estação", ends_on: nil, closed_at: nil)
    expect([ task.reload.season_id, goal.reload.season_id, completion.reload.season_id ]).to eq([ season.id ] * 3)
  end

  it "starts the estação on the oldest day the colmeia has" do
    household = Household.create!(name: "Casa")
    task = household.tasks.build(title: "Antiga", points: 5)
    task.created_at = 3.weeks.ago
    orphan(task)
    orphan(household.completions.build(task_title: "Mais antiga", task_points: 5, points_awarded: 5, completed_at: 5.weeks.ago))

    migrate!

    expect(household.seasons.sole.starts_on).to eq(5.weeks.ago.to_date)
  end

  it "starts today when the colmeia has nothing yet" do
    household = Household.create!(name: "Casa vazia")

    migrate!

    expect(household.seasons.sole.starts_on).to eq(Date.current)
  end

  it "leaves a colmeia that already has an estação alone" do
    household = Household.create!(name: "Casa")
    season = household.seasons.create!(name: "Estação atual", starts_on: Date.current - 5)
    task = household.tasks.create!(season: season, title: "Louça", points: 5)

    migrate!

    expect(household.seasons.pluck(:name)).to eq([ "Estação atual" ])
    expect(task.reload.season_id).to eq(season.id)
  end

  it "keeps each colmeia's records inside its own estação" do
    first = Household.create!(name: "Primeira")
    second = Household.create!(name: "Segunda")
    mine = orphan(first.tasks.build(title: "Minha", points: 5))
    theirs = orphan(second.tasks.build(title: "Deles", points: 5))

    migrate!

    expect(mine.reload.season.household_id).to eq(first.id)
    expect(theirs.reload.season.household_id).to eq(second.id)
    expect(mine.season_id).not_to eq(theirs.season_id)
  end

  it "runs on an empty database without inventing anything" do
    expect { migrate! }.not_to raise_error
    expect(Season.count).to eq(0)
  end
end
