"use client";

import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { resolveTeamLogoUrl } from "../lib/constants";

interface TeamLogoProps {
  teamName: string;
  className?: string;
}

export function TeamLogo({ teamName, className = "" }: TeamLogoProps) {
  const [error, setError] = useState(false);
  const [referrerAttempt, setReferrerAttempt] = useState<0 | 1>(0);
  const resolvedUrl = resolveTeamLogoUrl(teamName, undefined);

  useEffect(() => {
    setError(false);
    setReferrerAttempt(0);
  }, [teamName, resolvedUrl]);

  // Fallback if URL is missing or error occurred
  if (!resolvedUrl || error) {
    // Extract initials (up to 2 chars)
    const initials = teamName
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    // Generate a consistent pastel color based on team name
    const colors = [
      "bg-red-500/20 text-red-400 border-red-500/30",
      "bg-blue-500/20 text-blue-400 border-blue-500/30",
      "bg-green-500/20 text-green-400 border-green-500/30",
      "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      "bg-purple-500/20 text-purple-400 border-purple-500/30",
      "bg-pink-500/20 text-pink-400 border-pink-500/30",
      "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      "bg-orange-500/20 text-orange-400 border-orange-500/30",
    ];
    
    // Simple hash function to pick color
    const hash = teamName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorClass = colors[hash % colors.length];

    // If className has width/height, use them. Otherwise default.
    // We assume className provides dimensions.
    // If we are falling back, we might want to ensure it has a border and rounded shape
    
    return (
      <div 
        className={`flex items-center justify-center rounded-full border ${colorClass} font-bold text-xs select-none ${className}`}
        title={teamName}
        aria-label={`${teamName} logo placeholder`}
      >
        {initials || <Shield className="w-1/2 h-1/2" />}
      </div>
    );
  }

  return (
    <img
      src={resolvedUrl}
      alt={`${teamName} logo`}
      className={`${className} object-contain`}
      referrerPolicy={referrerAttempt === 0 ? "no-referrer" : "origin"}
      onError={() => {
        if (referrerAttempt === 0) {
          setReferrerAttempt(1);
          return;
        }
        setError(true);
      }}
      loading="lazy"
    />
  );
}
