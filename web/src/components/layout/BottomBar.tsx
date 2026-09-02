import { Ellipsis } from "lucide-react";
import { splitBottomBar } from "../../domain/navigation";
import { useDisclosure } from "../../hooks/useDisclosure";
import { useNavItems } from "../../hooks/useNavItems";
import { MoreNavSheet } from "./MoreNavSheet";
import { NavLinks, navLinkClasses } from "./NavLinks";

/** Five slots wide on a phone. Whatever does not fit waits behind "Mais". */
export function BottomBar() {
  const { visible } = useNavItems();
  const sheet = useDisclosure();
  const { tabs, overflow } = splitBottomBar(visible);

  const more = (
    <button type="button" onClick={sheet.open} aria-expanded={sheet.isOpen} className={navLinkClasses("tabs", false)}>
      <Ellipsis className="size-5" aria-hidden />
      Mais
    </button>
  );

  return (
    <>
      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <NavLinks items={tabs} layout="tabs" trailing={overflow.length === 0 ? undefined : more} />
      </nav>
      <MoreNavSheet open={sheet.isOpen} onClose={sheet.close} items={overflow} />
    </>
  );
}
