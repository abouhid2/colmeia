module HouseholdSerializer
  def self.call(household)
    { id: household.id, name: household.name }
  end
end
