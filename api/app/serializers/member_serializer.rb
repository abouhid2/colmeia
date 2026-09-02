module MemberSerializer
  def self.call(member)
    {
      id: member.id,
      name: member.name,
      avatar: member.avatar,
      color: member.color,
      kind: member.kind,
      points_multiplier: member.points_multiplier.to_f,
      crown_title: member.crown_title,
      favorite_achievements: member.favorite_achievements,
      nav_preferences: NavPreferences.normalize(member.nav_preferences),
      claimed: member.claimed?,
      claimed_at: member.claimed_at,
      created_at: member.created_at
    }
  end
end
