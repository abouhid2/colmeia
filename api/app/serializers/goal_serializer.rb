module GoalSerializer
  def self.call(goal)
    {
      id: goal.id,
      season_id: goal.season_id,
      title: goal.title,
      target_points: goal.target_points,
      member_id: goal.member_id,
      created_at: goal.created_at
    }
  end
end
