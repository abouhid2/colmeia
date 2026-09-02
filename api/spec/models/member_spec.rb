require "rails_helper"

RSpec.describe Member do
  let(:household) { Household.create!(name: "Casa") }

  it "starts as a placeholder nobody has claimed" do
    member = household.members.create!(name: "Ana")

    expect(member).not_to be_claimed
    expect(described_class.unclaimed).to include(member)
  end

  it "fills the honeycomb solid until somebody picks a texture" do
    member = household.members.create!(name: "Ana")

    expect(member.pattern).to eq("solid")
    expect(member.update(pattern: "waves")).to be(true)

    member.pattern = "glitter"
    expect(member).not_to be_valid
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

  it "starts as a bee earning exactly what a task is worth" do
    member = household.members.create!(name: "Ana")

    expect(member).not_to be_lagartinha
    expect(member.points_multiplier).to eq(1)
    expect(member.award(20)).to eq(20)
  end

  it "hands a new lagartinha the default handicap" do
    member = household.members.create!(name: "Duda")

    member.update!(kind: "lagartinha")

    expect(member.reload.points_multiplier).to eq(described_class::DEFAULT_LAGARTINHA_MULTIPLIER)
    expect(member.award(5)).to eq(8)
    expect(described_class.lagartinhas).to include(member)
  end

  it "keeps a multiplier the family chose" do
    member = household.members.create!(name: "Duda", kind: "lagartinha", points_multiplier: 2)

    member.update!(name: "Eduarda")

    expect(member.reload.points_multiplier).to eq(2)
  end

  it "leaves the multiplier alone when a lagartinha becomes a bee" do
    member = household.members.create!(name: "Duda", kind: "lagartinha")

    member.update!(kind: "bee")

    expect(member.reload.points_multiplier).to eq(described_class::DEFAULT_LAGARTINHA_MULTIPLIER)
  end

  it "starts with an empty shelf of pinned badges" do
    member = household.members.create!(name: "Ana")

    expect(member.reload.favorite_achievements).to eq([])
  end

  it "pins badges it knows, up to three, without repeating" do
    member = household.members.create!(name: "Ana")

    member.update!(favorite_achievements: %w[ firstTask bigTask ])
    expect(member.reload.favorite_achievements).to eq(%w[ firstTask bigTask ])

    expect(member.update(favorite_achievements: %w[ firstTask firstTask ])).to be(false)
    expect(member.update(favorite_achievements: %w[ firstTask melhorDaCasa ])).to be(false)
    expect(member.update(favorite_achievements: %w[ firstTask bigTask flawless sevenDays ])).to be(false)
    expect(member.reload.favorite_achievements).to eq(%w[ firstTask bigTask ])
  end

  it "takes its badges along when it leaves the colmeia" do
    member = household.members.create!(name: "Ana")
    household.achievement_awards.create!(member: member, key: "firstTask", awarded_at: Time.current)

    member.destroy!

    expect(AchievementAward.count).to eq(0)
  end

  it "refuses an unknown kind and a multiplier out of range" do
    member = household.members.new(name: "Duda", kind: "borboleta")
    expect(member).not_to be_valid

    expect(household.members.new(name: "Duda", points_multiplier: 0.1)).not_to be_valid
    expect(household.members.new(name: "Duda", points_multiplier: 4)).not_to be_valid
  end
end
