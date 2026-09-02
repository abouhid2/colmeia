# Which screens one person keeps in their navigation, and in what order.
#
# The keys are the app's own screens. A stored preference outlives the release
# that wrote it, so anything unknown here comes from an older or a newer client:
# it is dropped rather than kept, and whatever the person never named is filled
# in by the app in its default order. That is how a new screen shows up for
# everyone without a backfill.
module NavPreferences
  KEYS = %w[ home tasks goals shopping family achievements seasons ].freeze
  # Início is the way back to everything else, so it never leaves the bar.
  PINNED_KEY = "home"

  # An empty preference for anything that is not one: a bad payload loses, the
  # navigation does not.
  def self.normalize(value)
    hash = to_hash(value)
    { "order" => known(hash["order"]), "hidden" => known(hash["hidden"]) - [ PINNED_KEY ] }
  end

  # Known screens, once each, in the order they were given.
  def self.known(list)
    return [] unless list.is_a?(Array)

    list.map(&:to_s).select { |key| KEYS.include?(key) }.uniq
  end

  # A preference arrives as a Hash from the database or as params from the app.
  def self.to_hash(value)
    return value.to_h.stringify_keys if value.respond_to?(:permitted?)

    value.is_a?(Hash) ? value.stringify_keys : {}
  end
  private_class_method :to_hash
end
