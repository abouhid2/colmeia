import { X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { dismissExampleNotice, isExampleNoticeDismissed } from "../../api/exampleNotice";
import { browserStore } from "../../api/storage";
import { useHousehold } from "../../hooks/useHousehold";
import { useSessionContext } from "../../hooks/useSessionContext";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";

const store = browserStore();

/** Says out loud that this colmeia is a sandbox, and offers both ways out. */
export function ExampleBanner() {
  const { data: household } = useHousehold();
  const { leave } = useSessionContext();
  const navigate = useNavigate();
  const [ dismissed, setDismissed ] = useState(() => isExampleNoticeDismissed(store));

  if (household?.demo !== true || dismissed) return null;

  const dismiss = () => {
    dismissExampleNotice(store);
    setDismissed(true);
  };

  return (
    <div className="border-b border-honey-200 bg-honey-100">
      <div className="mx-auto flex w-full max-w-5xl items-start gap-2 px-4 py-2.5">
        <div className="min-w-0 flex-1 space-y-2 sm:flex sm:items-center sm:gap-4 sm:space-y-0">
          <p className="text-sm sm:flex-1">
            <span className="font-semibold">Você está numa família de exemplo.</span> Mexa à vontade: nada aqui é de verdade.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => void navigate("/nova")}>Criar minha colmeia</Button>
            <Button variant="ghost" size="sm" onClick={leave}>Sair do exemplo</Button>
          </div>
        </div>
        <IconButton label="Dispensar aviso" icon={<X className="size-4" />} className="-mr-2 shrink-0" onClick={dismiss} />
      </div>
    </div>
  );
}
