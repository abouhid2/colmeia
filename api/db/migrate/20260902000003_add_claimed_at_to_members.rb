class AddClaimedAtToMembers < ActiveRecord::Migration[8.1]
  def up
    add_column :members, :claimed_at, :datetime

    # People who were already using the app are in it: nobody has to claim them.
    execute("UPDATE members SET claimed_at = created_at WHERE claimed_at IS NULL")
  end

  def down
    remove_column :members, :claimed_at
  end
end
