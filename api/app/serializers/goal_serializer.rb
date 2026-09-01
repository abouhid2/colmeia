module GoalSerializer
  def self.call(goal)
    {
      id: goal.id,
      title: goal.title,
      target_points: goal.target_points,
      period: goal.period,
      member_id: goal.member_id,
      created_at: goal.created_at
    }
  end
end
