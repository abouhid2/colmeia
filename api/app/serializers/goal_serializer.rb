module GoalSerializer
  def self.call(goal)
    {
      id: goal.id,
      season_id: goal.season_id,
      title: goal.title,
      target_points: goal.target_points,
      member_ids: goal.member_ids,
      starts_on: goal.starts_on,
      ends_on: goal.ends_on,
      created_at: goal.created_at
    }
  end
end
