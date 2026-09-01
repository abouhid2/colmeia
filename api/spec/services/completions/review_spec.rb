require "rails_helper"

RSpec.describe Completions::Review do
  let(:household) { Household.create!(name: "Casa") }
  let(:worker) { household.members.create!(name: "Bruno") }
  let(:reviewer) { household.members.create!(name: "Ana") }
  let(:completion) do
    household.completions.create!(member: worker, status: "pending", task_title: "Banheiro", task_points: 20, completed_at: Time.current)
  end

  it "approves the completion and awards points by rating" do
    reviewed = described_class.new(completion: completion, reviewer: reviewer, rating: 3).call

    expect(reviewed).to have_attributes(status: "approved", rating: 3, points_awarded: 12, reviewer: reviewer)
    expect(reviewed.reviewed_at).to be_present
  end

  it "does not let members grade their own work" do
    expect { described_class.new(completion: completion, reviewer: worker, rating: 5).call }
      .to raise_error(described_class::SelfReview)
    expect(completion.reload).to be_pending
  end

  it "does not review twice" do
    described_class.new(completion: completion, reviewer: reviewer, rating: 5).call

    expect { described_class.new(completion: completion, reviewer: reviewer, rating: 1).call }
      .to raise_error(described_class::AlreadyReviewed)
    expect(completion.reload.points_awarded).to eq(20)
  end

  it "refuses a reviewer from another colmeia" do
    stranger = Household.create!(name: "Outra").members.create!(name: "Estranho")

    expect { described_class.new(completion: completion, reviewer: stranger, rating: 5).call }
      .to raise_error(ActiveRecord::RecordNotFound)
    expect(completion.reload).to be_pending
  end
end
