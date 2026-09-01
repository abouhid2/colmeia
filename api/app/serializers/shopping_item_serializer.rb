module ShoppingItemSerializer
  def self.call(item)
    {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      added_by_id: item.added_by_id,
      purchased: item.purchased,
      purchased_by_id: item.purchased_by_id,
      purchased_at: item.purchased_at,
      created_at: item.created_at
    }
  end
end
