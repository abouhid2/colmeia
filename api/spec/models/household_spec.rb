require "rails_helper"

RSpec.describe Household do
  it "gives every new colmeia a unique lowercase invite code" do
    codes = Array.new(3) { |index| described_class.create!(name: "Casa #{index}").invite_code }

    expect(codes.uniq.size).to eq(3)
    expect(codes).to all(match(/\A[a-z0-9]{#{described_class::INVITE_CODE_LENGTH}}\z/))
  end

  it "stores a code that was given on purpose in lowercase" do
    expect(described_class.create!(name: "Casa", invite_code: "DeMo").invite_code).to eq("demo")
  end

  it "keeps a code that was given on purpose" do
    expect(described_class.create!(name: "Casa", invite_code: "demo").invite_code).to eq("demo")
  end

  it "refuses a duplicated code" do
    described_class.create!(name: "Uma", invite_code: "demo")

    expect { described_class.create!(name: "Outra", invite_code: "demo") }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it "takes its records down with it" do
    household = described_class.create!(name: "Casa")
    household.tasks.create!(title: "Louça", points: 5)
    household.goals.create!(title: "Pizza", target_points: 100)
    household.shopping_items.create!(name: "Leite")

    household.destroy!

    expect([ Task.count, Goal.count, ShoppingItem.count ]).to eq([ 0, 0, 0 ])
  end
end
