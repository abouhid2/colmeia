import { useQuery } from "@tanstack/react-query";
import type { ShoppingItem, ShoppingItemInput, ShoppingItemUpdate } from "../domain/types";
import { queryKeys } from "./queryKeys";
import { useApi } from "./useApi";
import { useAppMutation } from "./useAppMutation";

const EMPTY: ShoppingItem[] = [];

export function useShoppingItems() {
  const api = useApi();
  const query = useQuery({ queryKey: queryKeys.shopping, queryFn: () => api.shopping.list() });
  const items = query.data ?? EMPTY;
  return {
    ...query,
    toBuy: items.filter((item) => !item.purchased),
    purchased: items.filter((item) => item.purchased),
  };
}

export function useShoppingMutations() {
  const api = useApi();
  const invalidates = [queryKeys.shopping] as const;
  const add = useAppMutation((input: ShoppingItemInput) => api.shopping.create(input), { invalidates });
  const update = useAppMutation(
    ({ id, input }: { id: number; input: ShoppingItemUpdate }) => api.shopping.update(id, input),
    { invalidates },
  );
  const remove = useAppMutation((id: number) => api.shopping.remove(id), { invalidates });
  const clearPurchased = useAppMutation(() => api.shopping.clearPurchased(), { invalidates });
  return { add, update, remove, clearPurchased };
}
