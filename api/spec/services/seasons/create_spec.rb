require "rails_helper"

RSpec.describe Seasons::Create do
  let(:household) { create_household }
  let(:season) { season_of(household) }
  let(:member) { household.members.create!(name: "Ana") }

  def open_season_copying_from(source)
    described_class.new(
      household: household,
      attributes: { name: "Nova", starts_on: Date.current },
      copy_tasks_from_season_id: source.id
    ).call
  end

  it "keeps the boa para lagartinhas mark on a copied task" do
    household.tasks.create!(season: season, title: "Regar as plantas", points: 5, kid_friendly: true)
    household.tasks.create!(season: season, title: "Trocar a resistência", points: 50)

    copied = open_season_copying_from(season).tasks.order(:created_at)

    expect(copied.pluck(:title, :kid_friendly)).to eq([ [ "Regar as plantas", true ], [ "Trocar a resistência", false ] ])
  end

  it "carries the rest of what a task is over with it" do
    household.tasks.create!(
      season: season, title: "Limpar o banheiro", points: 20, priority: "high", recurrence: "weekly",
      requires_review: true, assignee: member, created_by: member
    )

    copied = open_season_copying_from(season).tasks.first

    expect(copied).to have_attributes(
      points: 20, priority: "high", recurrence: "weekly", requires_review: true,
      assignee_id: member.id, created_by_id: member.id, status: "open"
    )
  end
end
