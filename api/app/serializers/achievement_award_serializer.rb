module AchievementAwardSerializer
  def self.call(award)
    {
      id: award.id,
      member_id: award.member_id,
      key: award.key,
      completion_id: award.completion_id,
      awarded_at: award.awarded_at
    }
  end
end
