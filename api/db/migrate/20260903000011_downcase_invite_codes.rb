class DowncaseInviteCodes < ActiveRecord::Migration[8.1]
  CODE_LENGTH = 12

  # Bare table access: this is data, and the model may move on without it.
  class MigrationHousehold < ActiveRecord::Base
    self.table_name = "households"
  end

  # Codes are typed by hand off somebody else's phone screen, so lookups
  # downcase what arrives. That only finds the colmeia if what is stored is
  # lowercase too.
  def up
    MigrationHousehold.find_each do |household|
      code = household.invite_code.to_s
      next if code == code.downcase

      household.update_columns(invite_code: free_code(code.downcase))
    end
  end

  def down
    # Nothing to undo: the colmeia still answers to the code that was shared.
  end

  private

  # Two codes that differ only in case would collide once lowercased. The
  # second one draws a new code instead of failing the whole migration.
  def free_code(code)
    return code unless MigrationHousehold.exists?(invite_code: code)

    loop do
      candidate = SecureRandom.alphanumeric(CODE_LENGTH).downcase
      return candidate unless MigrationHousehold.exists?(invite_code: candidate)
    end
  end
end
