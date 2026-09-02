module SeasonTitleSerializer
  def self.call(title)
    {
      id: title.id,
      name: title.name,
      description: title.description,
      emoji: title.emoji,
      kind: title.kind,
      position: title.position,
      active: title.active
    }
  end
end
