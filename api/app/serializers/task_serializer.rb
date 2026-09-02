module TaskSerializer
  def self.call(task)
    {
      id: task.id,
      title: task.title,
      description: task.description,
      points: task.points,
      priority: task.priority,
      recurrence: task.recurrence,
      interval_days: task.interval_days,
      due_on: task.due_on,
      requires_review: task.requires_review,
      kid_friendly: task.kid_friendly,
      status: task.status,
      completed_at: task.completed_at,
      assignee_id: task.assignee_id,
      created_by_id: task.created_by_id,
      created_at: task.created_at
    }
  end
end
