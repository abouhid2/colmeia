require "rails_helper"

RSpec.describe Member do
  let(:household) { Household.create!(name: "Casa") }

  it "starts as a placeholder nobody has claimed" do
    member = household.members.create!(name: "Ana")

    expect(member).not_to be_claimed
    expect(described_class.unclaimed).to include(member)
  end

  it "stops taking new people once the house is full" do
    Member::MAX_PER_HOUSEHOLD.times { |index| household.members.create!(name: "Pessoa #{index}") }

    crowd = household.members.build(name: "Mais uma")

    expect(crowd).not_to be_valid
    expect(crowd.errors.full_messages.first).to include("já tem #{Member::MAX_PER_HOUSEHOLD} pessoas")
  end

  it "still lets the people already in it be edited" do
    Member::MAX_PER_HOUSEHOLD.times { |index| household.members.create!(name: "Pessoa #{index}") }

    expect(household.members.first.update(name: "Ana")).to be(true)
  end

  it "becomes a person once claimed" do
    member = household.members.create!(name: "Ana")

    member.claim!

    expect(member.reload).to be_claimed
    expect(described_class.unclaimed).to be_empty
  end
end
