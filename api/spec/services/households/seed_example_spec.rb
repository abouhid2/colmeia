require "rails_helper"

RSpec.describe Households::SeedExample do
  let(:household) { create_household(name: "Exemplo") }
  let(:now) { Time.zone.local(2026, 3, 11, 15, 0) }

  it "fills an empty colmeia with a family that has already been living in it" do
    described_class.new(household, now: now).call

    expect(household.members.pluck(:name)).to eq(%w[ Ana Bruno Clara Duda ])
    expect(household.tasks.count).to eq(12)
    expect(household.completions.count).to eq(16)
    expect(household.goals.count).to eq(4)
    expect(household.shopping_items.count).to eq(6)
  end

  it "leaves the closed estação already voted, with a winner and a draw" do
    described_class.new(household, now: now).call
    past = household.seasons.find_by(name: "Estação passada")
    bruno, clara, duda = household.members.where(name: %w[ Bruno Clara Duda ]).order(:id).to_a

    tally = ->(title) { past.season_title_votes.joins(:season_title).where(season_titles: { name: title }).pluck(:votee_id).tally }

    expect(tally.call("Pernilongo")).to include(bruno.id => 2)
    expect(tally.call("Lesma").values).to eq([ 1, 1 ])
    expect(tally.call("Lesma").keys).to contain_exactly(clara.id, duda.id)
  end

  it "hands back Ana, already claimed, so the visitor walks straight in" do
    member = described_class.new(household, now: now).call

    expect(member.name).to eq(described_class::ENTRY_MEMBER_NAME)
    expect(member).to be_claimed
    expect(household.members.unclaimed.pluck(:name)).to eq(%w[ Bruno Clara Duda ])
  end

  it "leaves something to review and a reward still out of reach" do
    described_class.new(household, now: now).call

    expect(household.completions.where(status: "pending").count).to eq(1)
    running = household.seasons.find_by!(closed_at: nil)
    goal = household.goals.find_by!(member_id: nil, season: running)
    expect(running.completions.sum(:points_awarded)).to be < goal.target_points
  end

  it "pays the lagartinha her multiplier all the way back through the history" do
    described_class.new(household, now: now).call
    duda = household.members.find_by!(name: "Duda")

    expect(duda).to have_attributes(kind: "lagartinha", points_multiplier: 1.5)
    expect(household.reload.lagartinhas_enabled).to be(true)
    hers = household.completions.where(member: duda)
    expect(hers.count).to be > 0
    expect(hers.pluck(:multiplier).uniq).to eq([ 1.5 ])
  end

  it "runs from db/seeds.rb, twice, without duplicating the example" do
    Rails.application.load_seed
    Rails.application.load_seed

    seeded = Household.find_by!(invite_code: "demo")
    expect(seeded.name).to eq(described_class::NAME)
    expect(seeded.members.pluck(:name)).to eq(%w[ Ana Bruno Clara Duda ])
    expect(seeded).to have_attributes(demo: true, lagartinhas_enabled: true)
    expect(Household.where(invite_code: "demo").count).to eq(1)
  end
end
