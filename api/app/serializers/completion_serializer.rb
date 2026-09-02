module CompletionSerializer
  def self.call(completion)
    {
      id: completion.id,
      season_id: completion.season_id,
      task_id: completion.task_id,
      member_id: completion.member_id,
      reviewer_id: completion.reviewer_id,
      status: completion.status,
      rating: completion.rating,
      points_awarded: completion.points_awarded,
      task_title: completion.task_title,
      task_points: completion.task_points,
      completed_at: completion.completed_at,
      reviewed_at: completion.reviewed_at
    }
  end
end
