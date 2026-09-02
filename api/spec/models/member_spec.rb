require "rails_helper"

RSpec.describe Member do
  let(:household) { Household.create!(name: "Casa") }

  it "starts as a placeholder nobody has claimed" do
    member = household.members.create!(name: "Ana")

    expect(member).not_to be_claimed
    expect(described_class.unclaimed).to include(member)
  end

  it "becomes a person once claimed" do
    member = household.members.create!(name: "Ana")

    member.claim!

    expect(member.reload).to be_claimed
    expect(described_class.unclaimed).to be_empty
  end
end
