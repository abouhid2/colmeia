import { useNavigate, useParams } from "react-router";
import { useDisclosure } from "../hooks/useDisclosure";
import { useInvite } from "../hooks/useInvite";
import { BrandMark } from "../components/layout/BrandMark";
import { PlainPage } from "../components/layout/PlainPage";
import { ClaimList } from "../components/household/ClaimList";
import { JoinForm } from "../components/household/JoinForm";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Link2Off } from "lucide-react";

/** The invite link lands here: pick who you are and the browser is in. */
export function InvitePage() {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  // Codes get typed by hand, so the link answers in any case and the browser
  // files this colmeia under one name only.
  const { household, isLoading, isMissing, knownMemberId, resume, claim, join } = useInvite(code.toLowerCase());
  const joining = useDisclosure();

  if (isLoading) {
    return <PlainPage><BrandMark className="animate-pulse justify-center" /></PlainPage>;
  }

  if (isMissing || household === undefined) {
    return (
      <PlainPage>
        <EmptyState
          icon={<Link2Off className="size-6" />}
          title="Esse convite não existe"
          hint="Confira o link com quem te chamou. Ou crie a sua própria colmeia."
          action={<Button onClick={() => void navigate("/")}>Voltar ao início</Button>}
        />
      </PlainPage>
    );
  }

  const pendingId = claim.isPending ? (claim.variables ?? null) : null;

  return (
    <PlainPage>
      <div className="text-center">
        <BrandMark className="justify-center" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight">{household.name}</h1>
        <p className="mt-2 text-ink-soft">Quem é você aqui?</p>
      </div>

      {household.members.length > 0 && (
        <ClaimList
          members={household.members}
          knownMemberId={knownMemberId}
          pendingId={pendingId}
          onClaim={(memberId) => claim.mutate(memberId)}
          onResume={resume}
        />
      )}

      {joining.isOpen ? (
        <JoinForm lagartinhasEnabled={household.lagartinhasEnabled} submitting={join.isPending} onSubmit={(input) => join.mutate(input)} onCancel={joining.close} />
      ) : (
        <Button variant="secondary" size="lg" className="w-full" onClick={joining.open}>
          {household.members.length === 0 ? "Entrar nesta colmeia" : "Sou outra pessoa"}
        </Button>
      )}
    </PlainPage>
  );
}
