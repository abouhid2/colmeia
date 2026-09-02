module HouseholdSerializer
  def self.call(household)
    {
      id: household.id, name: household.name, invite_code: household.invite_code,
      demo: household.demo, lagartinhas_enabled: household.lagartinhas_enabled
    }
  end

  # What the invite page needs: the colmeia and who is already in it.
  def self.with_members(household, members = household.members.order(:created_at))
    call(household).merge(members: members.map { |member| MemberSerializer.call(member) })
  end
end
