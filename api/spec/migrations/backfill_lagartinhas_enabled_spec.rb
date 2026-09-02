require "rails_helper"
require Rails.root.join("db/migrate/20260903000061_backfill_lagartinhas_enabled")

RSpec.describe BackfillLagartinhasEnabled do
  def migrate!
    ActiveRecord::Migration.suppress_messages { described_class.new.up }
  end

  def member_of(household, name:, kind:)
    household.members.create!(name: name, avatar: "🐝", color: "honey", kind: kind)
  end

  it "turns the lagartinhas on for a colmeia that already has one" do
    household = create_household(name: "Casa com criança")
    member_of(household, name: "Ana", kind: "bee")
    member_of(household, name: "Duda", kind: "lagartinha")

    migrate!

    expect(household.reload.lagartinhas_enabled).to be(true)
  end

  it "leaves a colmeia of grown-ups the way it was" do
    household = create_household(name: "Casa sem criança")
    member_of(household, name: "Ana", kind: "bee")

    migrate!

    expect(household.reload.lagartinhas_enabled).to be(false)
  end

  it "answers for each colmeia on its own" do
    with_child = create_household(name: "Com")
    without = create_household(name: "Sem")
    member_of(with_child, name: "Duda", kind: "lagartinha")
    member_of(without, name: "Bruno", kind: "bee")

    migrate!

    expect([ with_child.reload.lagartinhas_enabled, without.reload.lagartinhas_enabled ]).to eq([ true, false ])
  end

  it "runs on an empty database without inventing anything" do
    expect { migrate! }.not_to raise_error
  end
end
