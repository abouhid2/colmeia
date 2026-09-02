import type { Member, MemberColor, MemberPattern } from "../../domain/types";
import { Avatar } from "../ui/Avatar";
import { Field } from "../ui/Field";
import { ColorPicker } from "./ColorPicker";
import { MemberMark } from "./MemberMark";
import { PatternPicker } from "./PatternPicker";

interface MemberMarkSettingsProps {
  member: Member;
  onColor(color: MemberColor): void;
  onPattern(pattern: MemberPattern): void;
}

/** How somebody shows up in the colmeia: the colour they wear and the texture
 *  their share of the favo is filled with, both live above the pickers. */
export function MemberMarkSettings({ member, onColor, onPattern }: MemberMarkSettingsProps) {
  return (
    <div className="space-y-4 rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center gap-3">
        <span className="relative shrink-0">
          <Avatar member={member} size="lg" />
          <MemberMark member={member} className="absolute -bottom-1 -right-1 size-6" />
        </span>
        <p className="text-ink-soft">Suas tarefas enchem o favo assim</p>
      </div>
      <Field label="Cor">
        <ColorPicker color={member.color} onColor={onColor} />
      </Field>
      <Field label="Textura">
        <PatternPicker color={member.color} pattern={member.pattern} onPattern={onPattern} />
      </Field>
    </div>
  );
}
