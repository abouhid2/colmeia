module MemberSerializer
  def self.call(member)
    {
      id: member.id,
      name: member.name,
      avatar: member.avatar,
      color: member.color,
      crown_title: member.crown_title,
      created_at: member.created_at
    }
  end
end
