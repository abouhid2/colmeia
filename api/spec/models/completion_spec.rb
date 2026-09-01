require "rails_helper"

RSpec.describe Completion do
  describe ".points_for" do
    it "awards every point for five stars" do
      expect(described_class.points_for(20, 5)).to eq(20)
    end

    it "awards a fifth for one star" do
      expect(described_class.points_for(20, 1)).to eq(4)
    end

    it "rounds to the nearest point" do
      expect(described_class.points_for(7, 3)).to eq(4)
      expect(described_class.points_for(5, 3)).to eq(3)
    end
  end

  it "rejects ratings outside 1..5" do
    completion = described_class.new(task_title: "x", task_points: 1, completed_at: Time.current, rating: 6)
    expect(completion).not_to be_valid
  end
end
