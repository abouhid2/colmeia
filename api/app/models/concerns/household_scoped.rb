# Every record lives inside one colmeia. Whatever it points at must live in the
# same one, so an id borrowed from another colmeia is never usable here.
module HouseholdScoped
  extend ActiveSupport::Concern

  included do
    belongs_to :household
  end

  class_methods do
    def belongs_to_in_household(name, **options)
      belongs_to(name, **options)
      validate { reject_foreign_household(name) }
    end
  end

  private

  def reject_foreign_household(name)
    related = public_send(name)
    return if related.nil? || related.household_id == household_id

    errors.add(name, "is from another colmeia")
  end
end
