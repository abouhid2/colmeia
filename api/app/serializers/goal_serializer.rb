module GoalSerializer
  def self.call(goal)
    return nil if goal.nil?

    { id: goal.id, title: goal.title, target_points: goal.target_points, period: goal.period }
  end
end
