require "rails_helper"
require "rake"

RSpec.describe "demo:cleanup" do
  before do
    Rails.application.load_tasks unless Rake::Task.task_defined?("demo:cleanup")
    Rake::Task["demo:cleanup"].reenable
  end

  def run_cleanup
    Rake::Task["demo:cleanup"].execute
  end

  it "sweeps the sandboxes nobody came back to, with everything inside them" do
    cold = Household.create!(name: "Exemplo", demo: true, created_at: 8.days.ago)
    season = cold.seasons.create!(name: "Estação atual", starts_on: Date.current)
    cold.tasks.create!(season: season, title: "Louça", points: 5)

    expect { run_cleanup }.to output("Removidas 1 colmeias de exemplo.\n").to_stdout

    expect(Household.where(id: cold.id)).to be_empty
    expect(Task.count).to eq(0)
  end

  it "leaves this week's sandboxes alone" do
    warm = Household.create!(name: "Exemplo", demo: true, created_at: 2.days.ago)

    expect { run_cleanup }.to output(/Removidas 0/).to_stdout

    expect(warm.reload).to be_present
  end

  it "never touches a colmeia somebody lives in, however old" do
    house = create_household(name: "Casa")
    house.update_column(:created_at, 1.year.ago)

    expect { run_cleanup }.to output(/Removidas 0/).to_stdout

    expect(house.reload).to be_present
  end
end
