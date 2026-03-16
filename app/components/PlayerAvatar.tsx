import { User } from "lucide-react";
import { useState } from "react";

interface PlayerAvatarProps {
  name: string;
  photoUrl?: string;
  code?: string | number;
  className?: string;
}

export function PlayerAvatar({ name, photoUrl, code, className = "w-full h-full" }: PlayerAvatarProps) {
  const [error, setError] = useState(false);

  // Reverted logic: Use photoUrl directly if available, otherwise construct from code (no 'p' prefix forced unless in photoUrl)
  let finalUrl = photoUrl;
  
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
            src={fallbackUrl}
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
      src={finalUrl} 
      alt={name} 
      className={`${className} object-cover object-top`}
      onError={() => setError(true)}
    />
  );
}
