class AddLagartinhasEnabledToHouseholds < ActiveRecord::Migration[8.1]
  def change
    # Not every family has children, and a colmeia of adults has no use for
    # multipliers, a kids' league or tasks marked for a child. Off by default:
    # a colmeia only mentions lagartinhas once somebody says it has them.
    add_column :households, :lagartinhas_enabled, :boolean, null: false, default: false
  end
end
