import type { MemberColor } from "../../domain/types";
import { AvatarChoices } from "./AvatarChoices";
import { ColorPicker } from "./ColorPicker";

interface AvatarPickerProps {
  avatar: string;
  color: MemberColor;
  onAvatar(avatar: string): void;
  onColor(color: MemberColor): void;
}

export function AvatarPicker({ avatar, color, onAvatar, onColor }: AvatarPickerProps) {
  return (
    <div className="space-y-3">
      <AvatarChoices avatar={avatar} color={color} onAvatar={onAvatar} />
      <ColorPicker color={color} onColor={onColor} />
    </div>
  );
}
