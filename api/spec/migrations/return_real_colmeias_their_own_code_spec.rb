require "rails_helper"
require Rails.root.join("db/migrate/20260903000110_return_real_colmeias_their_own_code")

RSpec.describe ReturnRealColmeiasTheirOwnCode do
  it "gives a colmeia people live in a code of its own back" do
    household = Household.create!(name: "Casa", invite_code: "demo")

    described_class.new.up

    expect(household.reload.invite_code).to match(/\A[a-z0-9]{#{Household::INVITE_CODE_LENGTH}}\z/)
    expect(household.invite_code).not_to eq("demo")
  end

  it "leaves the sandbox colmeia on the code the example is served from" do
    sandbox = Household.create!(name: "Exemplo", invite_code: "demo", demo: true)

    described_class.new.up

    expect(sandbox.reload.invite_code).to eq("demo")
  end

  it "does nothing when no colmeia answers to demo" do
    household = Household.create!(name: "Casa", invite_code: "aaaabbbbcccc")

    described_class.new.up

    expect(household.reload.invite_code).to eq("aaaabbbbcccc")
  end
end
