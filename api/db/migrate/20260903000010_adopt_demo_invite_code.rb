class AdoptDemoInviteCode < ActiveRecord::Migration[8.1]
  DEMO_CODE = "demo".freeze

  # Bare table access: this is data, and the model may move on without it.
  class MigrationHousehold < ActiveRecord::Base
    self.table_name = "households"
  end

  # An install that predates invite codes got a random one from the migration
  # that added the column, but the browsers already using it bind themselves to
  # "demo". Handing the oldest colmeia that code keeps them inside their house
  # instead of answering 401 to every request.
  def up
    return if MigrationHousehold.exists?(invite_code: DEMO_CODE)

    MigrationHousehold.order(:id).first&.update_columns(invite_code: DEMO_CODE)
  end

  def down
    # Nothing to undo: a colmeia keeps whatever code it answers to.
  end
end
