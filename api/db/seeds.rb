# Example colmeia for local development, reachable at /entrar/demo. Safe to run
# more than once: the second run finds the same household and stops.
household = Household.find_or_create_by!(invite_code: "demo") { |record| record.name = Households::SeedExample::NAME }
# It is an example colmeia like the ones POST /households/demo hands out, so
# development sees the same banner and the same "recomeçar" the visitors see.
# The example family has Duda, so the example colmeia is one with lagartinhas.
household.update!(demo: true, lagartinhas_enabled: true)
return if household.members.exists?

Households::SeedExample.new(household).call
