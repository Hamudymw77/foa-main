import { Shield } from "lucide-react";
import { TEAM_LOGOS } from "../lib/constants";
import { useState, useEffect } from "react";

interface TeamBadgeProps {
  name: string;
  className?: string;
  showName?: boolean;
}

export function TeamBadge({ name, className = "w-10 h-10", showName = false }: TeamBadgeProps) {
  const [error, setError] = useState(false);

  // Normalize name lookup
  const logoUrl = TEAM_LOGOS[name] || TEAM_LOGOS[Object.keys(TEAM_LOGOS).find(k => k.toLowerCase() === name?.toLowerCase()) || ''];
  
  // Extract code from existing SVG URL to construct the requested PNG URL
  // format in constants: .../badges/t3.svg
  // requested format: .../badges/t3.png
  let pngUrl = logoUrl;
  if (logoUrl) {
    const match = logoUrl.match(/t(\d+)\.svg/);
    if (match) {
        pngUrl = `https://resources.premierleague.com/premierleague/badges/t${match[1]}.png`;
    }
  }

  if (pngUrl && !error) {
    return (
      <img 
        src={pngUrl} 
        alt={name} 
        className={`${className} object-contain drop-shadow-md`}
        title={name}
        onError={() => setError(true)}
      />
    );
  }

  // Fallback for non-PL teams using the Foreign Logo Proxy
  return <ForeignTeamBadge name={name} className={className} />;
}

function ForeignTeamBadge({ name, className }: { name: string, className: string }) {
    const [src, setSrc] = useState<string | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let mounted = true;
        const fetchLogo = async () => {
            try {
                // Use the proxy endpoint we created earlier
                const res = await fetch(`/api/foreign-logo?team=${encodeURIComponent(name)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (mounted && data.logo) setSrc(data.logo);
                    else if (mounted) setError(true);
                } else {
                    if (mounted) setError(true);
                }
            } catch {
                if (mounted) setError(true);
            }
        };
        
        // Only fetch if we have a name
        if (name) {
            fetchLogo();
        } else {
            setError(true);
        }
        
        return () => { mounted = false; };
    }, [name]);

    if (src && !error) {
        return (
            <img 
                src={src} 
                alt={name} 
                className={`${className} object-contain drop-shadow-md`}
                title={name}
                onError={() => setError(true)}
            />
        );
    }

    return (
        <div className={`flex items-center justify-center bg-white/10 rounded-full ${className}`} title={name}>
            <Shield className="w-1/2 h-1/2 text-white/40" />
        </div>
    );
}
