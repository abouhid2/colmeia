import { Star } from "lucide-react";
import { Link } from "react-router";
import type { AchievementRecord } from "../../domain/achievementHistory";
import { MAX_FAVORITE_ACHIEVEMENTS } from "../../domain/achievements";
import { AchievementBadge } from "./AchievementBadge";

interface FavoriteBadgesProps {
  favorites: AchievementRecord[];
  /** Empty slots only mean something to whoever can fill them. */
  isSelf: boolean;
  /** The member filter rides along with every link in the app. */
  search: string;
}

/** The three medals on the profile: what this person chose to show off. */
export function FavoriteBadges({ favorites, isSelf, search }: FavoriteBadgesProps) {
  if (favorites.length === 0 && !isSelf) return null;
  // An empty slot is an invitation, and only its owner can take it.
  const slots = isSelf ? MAX_FAVORITE_ACHIEVEMENTS - favorites.length : 0;

  return (
    <div className="flex flex-col items-center gap-1.5 sm:ml-auto sm:items-end">
      <ul className="flex gap-2">
        {favorites.map((favorite) => (
          <li key={favorite.id} title={favorite.name}>
            <AchievementBadge id={favorite.id} size="lg" className="ring-2 ring-honey-200" />
            <span className="sr-only">{favorite.name}</span>
          </li>
        ))}
        {Array.from({ length: slots }, (_, index) => (
          <li
            key={index}
            className="grid size-14 place-items-center rounded-full border border-dashed border-line-strong text-ink-faint"
            aria-hidden
          >
            <Star className="size-5" />
          </li>
        ))}
      </ul>
      {isSelf && (
        <Link to={{ pathname: "/conquistas", search }} className="text-xs font-semibold text-honey-700 hover:underline">
          {favorites.length === 0 ? `Fixe até ${MAX_FAVORITE_ACHIEVEMENTS} conquistas` : "Trocar as fixadas"}
        </Link>
      )}
    </div>
  );
}
