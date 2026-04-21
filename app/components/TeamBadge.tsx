import { Shield } from "lucide-react";
import { resolveTeamLogoUrl } from "../lib/constants";
import { useEffect, useState } from "react";

const foreignLogos: Record<string, string> = {
  "Real Madrid": "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
  "Barcelona": "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
  "Bayern Munich": "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
  "Bayern": "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
  "PSG": "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
  "Paris Saint-Germain": "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
  "Juventus": "https://upload.wikimedia.org/wikipedia/commons/b/bc/Juventus_FC_2017_icon_%28black%29.svg",
  "AC Milan": "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg",
  "Milan": "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg",
  "Inter": "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg",
  "Atletico Madrid": "https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg",
  "Atlético Madrid": "https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg",
  "Napoli": "https://upload.wikimedia.org/wikipedia/commons/2/2d/SSC_Napoli_2023.svg",
  "Dortmund": "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg"
};

const brokenTeams = [
  "Coventry City", "Hamburg", "LASK", "Cruzeiro", "Wigan", "Port Vale", "Accrington", "St. Pauli",
  "Cremonese", "Crewe", "Shrewsbury", "Brest", "Man United", "Kasimpasa", "Flamengo", "Ipswich Town",
  "Olympiacos", "Crvena zvezda", "Malmö", "Preston", "Stockport", "Bolton", "Birmingham",
  "Rennes", "Huddersfield", "Union SG", "Daejeon Hana Citizen", "Hellas Verona", "Independiente",
  "PSV Eindhoven", "Reading", "LA Galaxy", "Coventry", "Augsburg", "Swansea", "Fiorentina",
  "Millwall", "Dundee", "Doncaster", "Antwerp", "Toulouse", "Le Havre", "Palmeiras", "Shakhtar Donetsk",
  "Exeter", "St Mirren", "Auxerre", "Blackpool", "Montpellier", "Portsmouth", "Udinese", "Hoffenheim",
  "Al Hilal", "Leyton Orient", "Oxford United", "Chesterfield", "Colchester", "Wolfsburg", "Parma",
  "Suwon Bluewings", "Cerro Porteño", "Rosenborg", "Northampton", "Notts County", "West Brom",
  "Strasbourg", "Westerlo", "Ipswich", "Norwich", "lens", "Kawasaki", "Fluminense", "Nice",
  "Leipzig", "Southampton", "Leicester", "Slavia Praha", "Celta Vigo", "Botafogo", "Karlsruher"
];

interface TeamBadgeProps {
  name: string;
  className?: string;
  showName?: boolean;
}

export function TeamBadge({ name, className = "w-10 h-10", showName = false }: TeamBadgeProps) {
  const [error, setError] = useState(false);
  const [referrerAttempt, setReferrerAttempt] = useState<0 | 1>(0);
  const resolvedLogoUrl = resolveTeamLogoUrl(name, undefined);

  useEffect(() => {
    setError(false);
    setReferrerAttempt(0);
  }, [name, resolvedLogoUrl]);

  if (resolvedLogoUrl && !error) {
    return (
      <img
        src={resolvedLogoUrl}
        alt={name}
        className={`${className} object-contain drop-shadow-md`}
        title={name}
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

  // 1. Check Foreign Logos
  if (foreignLogos[name]) {
    return (
      <img 
        src={foreignLogos[name]} 
        alt={name} 
        className={`${className} object-contain drop-shadow-md`}
        title={name}
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

  // 2. Check Broken Teams or Empty Name
  if (!name || brokenTeams.includes(name)) {
    return (
      <div className={`flex items-center justify-center bg-white/10 rounded-full ${className}`} title={name}>
        <Shield className="w-1/2 h-1/2 text-white/40" />
      </div>
    );
  }

  // Fallback
  return (
    <div className={`flex items-center justify-center bg-white/10 rounded-full ${className}`} title={name}>
      <Shield className="w-1/2 h-1/2 text-white/40" />
    </div>
  );
}
