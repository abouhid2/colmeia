require "rails_helper"
require Rails.root.join("db/migrate/20260903000010_adopt_demo_invite_code")

RSpec.describe AdoptDemoInviteCode do
  it "hands the demo code to the oldest colmeia of an upgraded install" do
    first = Household.create!(name: "Casa", invite_code: "aaaabbbbcccc")
    second = Household.create!(name: "Outra", invite_code: "ddddeeeeffff")

    described_class.new.up

    expect(first.reload.invite_code).to eq("demo")
    expect(second.reload.invite_code).to eq("ddddeeeeffff")
  end

  it "leaves an existing demo colmeia alone instead of creating a second one" do
    older = Household.create!(name: "Antiga", invite_code: "aaaabbbbcccc")
    demo = Household.create!(name: "Demo", invite_code: "demo")

    described_class.new.up

    expect(Household.where(invite_code: "demo").pluck(:id)).to eq([ demo.id ])
    expect(older.reload.invite_code).to eq("aaaabbbbcccc")
  end

  it "does nothing on a database with no colmeia yet" do
    described_class.new.up

    expect(Household.count).to eq(0)
  end
end
