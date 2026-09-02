require "rails_helper"

RSpec.describe AchievementAward do
  let(:household) { Household.create!(name: "Casa") }
  let(:member) { household.members.create!(name: "Ana") }

  def award(attributes = {})
    household.achievement_awards.new({ member: member, key: "firstTask", awarded_at: Time.current }.merge(attributes))
  end

  it "refuses a badge nobody has heard of" do
    expect(award(key: "melhorDaCasa")).not_to be_valid
  end

  it "refuses the same badge twice for the same completion" do
    award(completion_id: 7).save!

    expect(award(completion_id: 7)).not_to be_valid
  end

  it "lets a repeatable badge come back from another completion" do
    award(key: "bigTask", completion_id: 7).save!

    expect(award(key: "bigTask", completion_id: 8)).to be_valid
  end

  it "outlives the completion that earned it" do
    completion = household.completions.create!(
      member: member, task_title: "Louça", task_points: 5, points_awarded: 5, completed_at: Time.current
    )
    written = award(key: "bigTask", completion_id: completion.id)
    written.save!

    completion.destroy!

    expect(written.reload.completion_id).to eq(completion.id)
  end

  it "refuses a completion from another colmeia" do
    other = Household.create!(name: "Casa alheia")
    alien = other.completions.create!(task_title: "Alheia", task_points: 5, points_awarded: 5, completed_at: Time.current)

    expect(award(completion_id: alien.id)).not_to be_valid
  end

  it "leaves with the person who earned it" do
    award.save!

    member.destroy!

    expect(described_class.count).to eq(0)
  end
end
