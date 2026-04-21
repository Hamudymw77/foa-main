import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { proxifyImageUrl } from "../lib/imageProxy";

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

export function PlayerAvatar({ name, photoUrl, code, className = "w-full h-full" }: PlayerAvatarProps) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [photoUrl, code]);

  // Reverted logic: Use photoUrl directly if available, otherwise construct from code (no 'p' prefix forced unless in photoUrl)
  let finalUrl = photoUrl && !isLikelyTeamLogoUrl(photoUrl) ? photoUrl : undefined;
  
  if (!finalUrl && code) {
      finalUrl = `https://resources.premierleague.com/premierleague/photos/players/110x140/${code}.png`;
  }

  // If no URL determined yet (shouldn't happen if code is present), use placeholder
  if (!finalUrl) {
      finalUrl = "https://resources.premierleague.com/premierleague/photos/players/110x140/Photo-Missing.png";
  }

  const fallbackUrl = "https://resources.premierleague.com/premierleague/photos/players/110x140/Photo-Missing.png";

  if (error) {
    return (
      <div className={`bg-slate-800 flex items-center justify-center ${className}`}>
        <img 
            src={proxifyImageUrl(fallbackUrl)}
            alt={name}
            className="w-full h-full object-cover object-top opacity-50"
            onError={(e) => {
                e.currentTarget.style.display = 'none';
            }}
        />
        <User className="w-1/3 h-1/3 text-white/20 absolute" />
      </div>
    );
  }

  return (
    <img 
      src={proxifyImageUrl(finalUrl)} 
      alt={name} 
      className={`${className} object-cover object-top`}
      onError={() => setError(true)}
    />
  );
}
