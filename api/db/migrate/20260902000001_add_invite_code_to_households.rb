class AddInviteCodeToHouseholds < ActiveRecord::Migration[8.1]
  CODE_LENGTH = 10

  # Bare table access: the app model validates a code that does not exist yet.
  class MigrationHousehold < ActiveRecord::Base
    self.table_name = "households"
  end

  def up
    add_column :households, :invite_code, :string
    add_index :households, :invite_code, unique: true

    MigrationHousehold.reset_column_information
    MigrationHousehold.where(invite_code: nil).find_each do |household|
      household.update_columns(invite_code: unused_code)
    end

    change_column_null :households, :invite_code, false
  end

  def down
    remove_index :households, :invite_code
    remove_column :households, :invite_code
  end

  private

  def unused_code
    loop do
      code = SecureRandom.alphanumeric(CODE_LENGTH)
      return code unless MigrationHousehold.exists?(invite_code: code)
    end
  end
end
