class ReturnRealColmeiasTheirOwnCode < ActiveRecord::Migration[8.1]
  DEMO_CODE = "demo".freeze
  INVITE_CODE_LENGTH = 12

  # Bare table access: this is data, and the model may move on without it.
  class MigrationHousehold < ActiveRecord::Base
    self.table_name = "households"
  end

  # 20260903000010 handed "demo" to the oldest colmeia, for an install that
  # predates invite codes and whose browsers already bind themselves to that
  # string. On a database that already had real colmeias with random codes it
  # renamed a house people live in: anybody who sends "demo" walks in, and
  # every invite link that colmeia handed out answers 401. A colmeia that is
  # not a sandbox gets a code of its own back.
  def up
    household = MigrationHousehold.find_by(invite_code: DEMO_CODE)
    return if household.nil? || household.demo?

    household.update_columns(invite_code: generate_invite_code)
  end

  def down
    # Nothing to undo: a colmeia keeps whatever code it answers to.
  end

  private

  def generate_invite_code
    loop do
      code = SecureRandom.alphanumeric(INVITE_CODE_LENGTH).downcase
      return code unless MigrationHousehold.exists?(invite_code: code)
    end
  end
end
