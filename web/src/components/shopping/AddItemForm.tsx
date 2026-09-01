import { Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { LIMITS } from "../../domain/limits";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface AddItemFormProps {
  submitting: boolean;
  onAdd(name: string, quantity: string | null): void;
}

export function AddItemForm({ submitting, onAdd }: AddItemFormProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim() === "") return;
    onAdd(name.trim(), quantity.trim() || null);
    setName("");
    setQuantity("");
  };

  return (
    <form onSubmit={submit} className="flex gap-2">
      <Input aria-label="O que está faltando" value={name} onChange={(event) => setName(event.target.value)} placeholder="O que está faltando?" maxLength={LIMITS.shoppingItemName} className="flex-1" />
      <Input aria-label="Quantidade" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="Qtd." maxLength={LIMITS.shoppingQuantity} className="w-24" />
      <Button type="submit" icon={<Plus className="size-4" />} loading={submitting} disabled={name.trim() === ""} aria-label="Adicionar item">
        <span className="hidden sm:inline">Adicionar</span>
      </Button>
    </form>
  );
}
