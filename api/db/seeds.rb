# Example colmeia for local development, reachable at /entrar/demo. Safe to run
# more than once: the second run finds the same household and stops.
household = Household.find_or_create_by!(invite_code: "demo") { |record| record.name = Households::SeedExample::NAME }
return if household.members.exists?

Households::SeedExample.new(household).call
