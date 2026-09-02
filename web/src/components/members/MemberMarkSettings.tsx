import { MEMBER_COLORS, MEMBER_COLOR_OPTIONS } from "../../domain/memberColors";
import type { Member, MemberColor, MemberPattern } from "../../domain/types";
import { useMemberMutations } from "../../hooks/useMembers";
import { cn } from "../../lib/cn";
import { Field } from "../ui/Field";
import { MemberMark } from "./MemberMark";
import { PatternPicker } from "./PatternPicker";

interface MemberMarkSettingsProps {
  member: Member;
}

/** How somebody's share of the honeycomb is drawn: their colour and their
 *  texture, saved the moment they pick one. Meant for a page of one's own
 *  settings; the dialog that edits a whole person has its own copy. */
export function MemberMarkSettings({ member }: MemberMarkSettingsProps) {
  const { update } = useMemberMutations();
  const save = (input: { color: MemberColor } | { pattern: MemberPattern }) => update.mutate({ id: member.id, input });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <MemberMark member={member} className="size-10" />
        <p className="text-ink-soft">É assim que suas tarefas aparecem no favo</p>
      </div>
      <Field label="Cor">
        <div role="radiogroup" aria-label="Cor" className="flex gap-2">
          {MEMBER_COLOR_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={member.color === option}
              aria-label={MEMBER_COLORS[option].label}
              title={MEMBER_COLORS[option].label}
              onClick={() => save({ color: option })}
              className={cn(
                "size-7 rounded-full transition-transform hover:scale-110",
                MEMBER_COLORS[option].swatch,
                member.color === option && "ring-2 ring-ink ring-offset-2 ring-offset-surface",
              )}
            />
          ))}
        </div>
      </Field>
      <Field label="Textura">
        <PatternPicker color={member.color} pattern={member.pattern} onPattern={(pattern) => save({ pattern })} />
      </Field>
    </div>
  );
}
