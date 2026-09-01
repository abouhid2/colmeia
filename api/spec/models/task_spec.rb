require "rails_helper"

RSpec.describe Task do
  describe "#next_due_on" do
    let(:from) { Date.new(2026, 1, 31) }

    it "is nil for one-off tasks" do
      expect(described_class.new(recurrence: "none").next_due_on(from)).to be_nil
    end

    it "adds a day for daily tasks" do
      expect(described_class.new(recurrence: "daily").next_due_on(from)).to eq(Date.new(2026, 2, 1))
    end

    it "adds a week for weekly tasks" do
      expect(described_class.new(recurrence: "weekly").next_due_on(from)).to eq(Date.new(2026, 2, 7))
    end

    it "adds a calendar month for monthly tasks, clamping the day" do
      expect(described_class.new(recurrence: "monthly").next_due_on(from)).to eq(Date.new(2026, 2, 28))
    end

    it "adds the interval for custom tasks" do
      task = described_class.new(recurrence: "custom", interval_days: 3)
      expect(task.next_due_on(from)).to eq(Date.new(2026, 2, 3))
    end
  end

  describe "validations" do
    it "requires interval_days for custom recurrence" do
      task = described_class.new(title: "Regar", recurrence: "custom")
      expect(task).not_to be_valid
      expect(task.errors[:interval_days]).to be_present
    end

    it "rejects zero points" do
      expect(described_class.new(title: "x", points: 0)).not_to be_valid
    end

    it "rejects unknown priorities" do
      expect(described_class.new(title: "x", priority: "meh")).not_to be_valid
    end
  end
end
