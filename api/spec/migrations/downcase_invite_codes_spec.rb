require "rails_helper"
require Rails.root.join("db/migrate/20260903000011_downcase_invite_codes")

RSpec.describe DowncaseInviteCodes do
  it "lowercases the codes an older install handed out" do
    household = Household.create!(name: "Casa")
    household.update_columns(invite_code: "aB3xY9zzQQrr")

    described_class.new.up

    expect(household.reload.invite_code).to eq("ab3xy9zzqqrr")
  end

  it "draws a new code when two of them differ only in case" do
    taken = Household.create!(name: "Primeira", invite_code: "ab3xy9zzqqrr")
    clashing = Household.create!(name: "Segunda")
    clashing.update_columns(invite_code: "AB3XY9ZZQQRR")

    described_class.new.up

    expect(taken.reload.invite_code).to eq("ab3xy9zzqqrr")
    expect(clashing.reload.invite_code).to match(/\A[a-z0-9]{#{described_class::CODE_LENGTH}}\z/)
  end
end
