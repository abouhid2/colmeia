module SeasonSerializer
  def self.call(season)
    {
      id: season.id,
      name: season.name,
      starts_on: season.starts_on,
      ends_on: season.ends_on,
      closed_at: season.closed_at,
      created_at: season.created_at,
      tasks_count: season.tasks.count,
      completions_count: season.completions.count
    }
  end
end
