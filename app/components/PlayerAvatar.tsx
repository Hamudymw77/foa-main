import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { getPlayerPhotoOverride } from "../lib/constants";

interface PlayerAvatarProps {
  name: string;
  photoUrl?: string;
  code?: string | number;
  className?: string;
}

function isLikelyTeamLogoUrl(url: string) {
  const v = String(url || '').toLowerCase();
  if (!v) return false;
  if (v.includes('/premierleague/badges/t')) return true;
  if (v.includes('upload.wikimedia.org') && (v.includes('logo') || v.includes('crest') || v.includes('icon'))) return true;
  return false;
}

function isMissingPlayerPhotoUrl(url: string | null | undefined) {
  const v = String(url || "").trim().toLowerCase();
  if (!v) return true;
  if (v.includes("photo-missing.png")) return true;
  if (v.endsWith("/p0.png")) return true;
  if (v.endsWith("/0.png")) return true;
  return false;
}

function Silhouette({ name, className }: { name: string; className: string }) {
  return (
    <div
      className={`bg-slate-800 flex items-center justify-center ${className}`}
      role="img"
      aria-label={name}
      title={name}
    >
      <User className="w-1/2 h-1/2 text-white/30" />
    </div>
  );
}

export function PlayerAvatar({ name, photoUrl, code, className = "w-full h-full" }: PlayerAvatarProps) {
  const [error, setError] = useState(false);
  const [referrerAttempt, setReferrerAttempt] = useState<0 | 1>(0);

  useEffect(() => {
    setError(false);
    setReferrerAttempt(0);
  }, [photoUrl, code]);

  // Reverted logic: Use photoUrl directly if available, otherwise construct from code (no 'p' prefix forced unless in photoUrl)
  const overrideUrl = getPlayerPhotoOverride(name);
  let finalUrl = overrideUrl || (photoUrl && !isLikelyTeamLogoUrl(photoUrl) ? photoUrl : undefined);
  
  if (!finalUrl && code) {
      finalUrl = `https://resources.premierleague.com/premierleague/photos/players/110x140/${code}.png`;
  }

  if (error) {
    return <Silhouette name={name} className={className} />;
  }

  if (!finalUrl || isMissingPlayerPhotoUrl(finalUrl)) {
    return <Silhouette name={name} className={className} />;
  }

  return (
    <img 
      key={`${finalUrl}-${referrerAttempt}`}
      src={finalUrl} 
      alt={name} 
      className={`${className} object-cover object-top`}
      referrerPolicy={referrerAttempt === 0 ? "no-referrer" : "origin"}
      onError={() => {
        if (referrerAttempt === 0) {
          setReferrerAttempt(1);
          return;
        }
        setError(true);
      }}
    />
  );
}
