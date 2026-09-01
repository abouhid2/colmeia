import { ShoppingBasket, Trash2 } from "lucide-react";
import type { ShoppingItem } from "../domain/types";
import { useMemberFilter } from "../hooks/useMemberFilter";
import { useMemberLookup } from "../hooks/useMembers";
import { useSession } from "../hooks/useSession";
import { useShoppingItems, useShoppingMutations } from "../hooks/useShopping";
import { MemberFilter } from "../components/members/MemberFilter";
import { AddItemForm } from "../components/shopping/AddItemForm";
import { ShoppingRow } from "../components/shopping/ShoppingRow";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { SectionHeading } from "../components/ui/SectionHeading";

export function ShoppingPage() {
  const items = useShoppingItems();
  const { add, update, remove, clearPurchased } = useShoppingMutations();
  const { currentMember } = useSession();
  const { memberId, member: filtered } = useMemberFilter();
  const lookup = useMemberLookup();
  const mine = (item: ShoppingItem) => memberId === null || item.addedById === memberId;
  const toBuy = items.toBuy.filter(mine);
  const purchased = items.purchased.filter(mine);

  const toggle = (item: ShoppingItem) => {
    update.mutate({ id: item.id, input: { purchased: !item.purchased, purchasedById: item.purchased ? null : (currentMember?.id ?? null) } });
  };

  const renderRow = (item: ShoppingItem) => (
    <ShoppingRow key={item.id} item={item} addedBy={lookup(item.addedById)} purchasedBy={lookup(item.purchasedById)} onToggle={toggle} onRemove={(target) => remove.mutate(target.id)} />
  );

  return (
    <div className="space-y-6 animate-rise">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Compras</h1>
        <p className="text-sm text-ink-soft">Uma lista só, todo mundo acrescenta.</p>
      </div>
      <AddItemForm submitting={add.isPending} onAdd={(name, quantity) => add.mutate({ name, quantity, addedById: currentMember?.id ?? null })} />
      <MemberFilter />

      <section>
        <SectionHeading title="Falta comprar" hint={toBuy.length === 0 ? undefined : `${toBuy.length} ${toBuy.length === 1 ? "item" : "itens"}`} />
        {toBuy.length === 0 ? (
          <EmptyState icon={<ShoppingBasket className="size-6" />} title={filtered ? `${filtered.name} não pediu nada` : "Lista vazia"} hint="Acabou algo? Escreva acima e a casa inteira vê." />
        ) : (
          <Card><ul className="divide-y divide-line">{toBuy.map(renderRow)}</ul></Card>
        )}
      </section>

      {purchased.length > 0 && (
        <section>
          <SectionHeading title="Já comprado" action={<Button variant="ghost" size="sm" icon={<Trash2 className="size-4" />} onClick={() => clearPurchased.mutate(undefined)} loading={clearPurchased.isPending}>Limpar</Button>} />
          <Card className="opacity-80"><ul className="divide-y divide-line">{purchased.map(renderRow)}</ul></Card>
        </section>
      )}
    </div>
  );
}
