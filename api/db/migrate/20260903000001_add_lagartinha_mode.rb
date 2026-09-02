class AddLagartinhaMode < ActiveRecord::Migration[8.1]
  def change
    # A lagartinha is a child: same colmeia, smaller reach, points scaled up so
    # the shared honeycomb still moves when she works.
    add_column :members, :kind, :string, null: false, default: "bee"
    add_column :members, :points_multiplier, :decimal, precision: 3, scale: 2, null: false, default: 1.0

    add_column :tasks, :kid_friendly, :boolean, null: false, default: false

    # Kept per completion so history stays honest when the multiplier changes.
    add_column :completions, :multiplier, :decimal, precision: 3, scale: 2, null: false, default: 1.0
  end
end
