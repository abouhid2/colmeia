class BackfillLagartinhasEnabled < ActiveRecord::Migration[8.1]
  # The column opens false, which is right for a colmeia nobody ever told about
  # children. A colmeia that already has one has answered the question by
  # living: leaving it off would take the multiplier, the league and the marks
  # away from a family that was using them. Same rule the browser store applies
  # to data written before the switch existed.
  def up
    execute(<<~SQL.squish)
      UPDATE households SET lagartinhas_enabled = #{quoted_true}
      WHERE id IN (SELECT household_id FROM members WHERE kind = 'lagartinha')
    SQL
  end

  # Nothing to undo: the column simply goes back to what it was told.
  def down
  end
end
