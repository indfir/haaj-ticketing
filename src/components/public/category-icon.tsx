interface Props {
  category: string;
  className?: string;
}

export function CategoryIcon({ category, className = "w-full h-full" }: Props) {
  switch (category) {
    case "OBSERVATION":
      return (
        <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="56" stroke="currentColor" strokeWidth="1" opacity="0.1" />
          <circle cx="60" cy="60" r="40" stroke="currentColor" strokeWidth="1" opacity="0.08" />
          {/* Telescope */}
          <line x1="35" y1="90" x2="55" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <line x1="85" y1="90" x2="65" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <rect x="48" y="30" width="24" height="22" rx="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.08" />
          <line x1="72" y1="38" x2="92" y2="28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          {/* Stars */}
          <circle cx="28" cy="25" r="2" fill="currentColor" opacity="0.4" />
          <circle cx="95" cy="18" r="1.5" fill="currentColor" opacity="0.3" />
          <circle cx="15" cy="55" r="1" fill="currentColor" opacity="0.25" />
        </svg>
      );

    case "WORKSHOP":
      return (
        <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="56" stroke="currentColor" strokeWidth="1" opacity="0.1" />
          {/* Whiteboard */}
          <rect x="25" y="25" width="70" height="50" rx="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.05" />
          <line x1="35" y1="40" x2="75" y2="40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
          <line x1="35" y1="48" x2="65" y2="48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
          <line x1="35" y1="56" x2="55" y2="56" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
          {/* Stand */}
          <line x1="60" y1="75" x2="60" y2="95" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
          <line x1="45" y1="95" x2="75" y2="95" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
          {/* Star accent */}
          <circle cx="80" cy="35" r="5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
        </svg>
      );

    case "LECTURE":
      return (
        <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="56" stroke="currentColor" strokeWidth="1" opacity="0.1" />
          {/* Book / podium */}
          <rect x="30" y="35" width="60" height="45" rx="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.05" />
          <line x1="60" y1="35" x2="60" y2="80" stroke="currentColor" strokeWidth="1.5" opacity="0.15" />
          {/* Lines of text */}
          <line x1="38" y1="48" x2="54" y2="48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
          <line x1="38" y1="56" x2="52" y2="56" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
          <line x1="38" y1="64" x2="50" y2="64" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
          <line x1="66" y1="48" x2="82" y2="48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
          <line x1="66" y1="56" x2="80" y2="56" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
          {/* Constellation */}
          <circle cx="45" cy="22" r="1.5" fill="currentColor" opacity="0.3" />
          <circle cx="60" cy="18" r="1.5" fill="currentColor" opacity="0.3" />
          <circle cx="75" cy="24" r="1.5" fill="currentColor" opacity="0.3" />
          <line x1="45" y1="22" x2="60" y2="18" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
          <line x1="60" y1="18" x2="75" y2="24" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
        </svg>
      );

    case "STARGAZING":
      return (
        <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
          {/* Moon crescent */}
          <path d="M70 30 A 25 25 0 1 0 70 80 A 18 18 0 1 1 70 30" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.08" />
          {/* Stars */}
          <circle cx="90" cy="25" r="2.5" fill="currentColor" opacity="0.5" />
          <circle cx="100" cy="45" r="1.5" fill="currentColor" opacity="0.35" />
          <circle cx="85" cy="60" r="1" fill="currentColor" opacity="0.25" />
          <circle cx="95" cy="75" r="2" fill="currentColor" opacity="0.4" />
          <circle cx="30" cy="20" r="1.5" fill="currentColor" opacity="0.3" />
          <circle cx="20" cy="40" r="2" fill="currentColor" opacity="0.35" />
          <circle cx="105" cy="30" r="1" fill="currentColor" opacity="0.2" />
          {/* Horizon line */}
          <line x1="10" y1="95" x2="110" y2="95" stroke="currentColor" strokeWidth="1" opacity="0.15" />
          {/* Silhouette hills */}
          <path d="M10 95 Q30 78 50 88 Q70 75 90 85 Q100 80 110 95" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="1" opacity="0.15" />
        </svg>
      );

    case "MEETUP":
      return (
        <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="56" stroke="currentColor" strokeWidth="1" opacity="0.1" />
          {/* People silhouettes */}
          <circle cx="40" cy="42" r="8" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08" />
          <path d="M25 72 Q25 58 40 58 Q55 58 55 72" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.05" />
          <circle cx="80" cy="42" r="8" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08" />
          <path d="M65 72 Q65 58 80 58 Q95 58 95 72" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.05" />
          {/* Connection */}
          <path d="M55 50 Q60 46 65 50" stroke="currentColor" strokeWidth="1" opacity="0.3" strokeDasharray="2 2" />
          {/* Star */}
          <circle cx="60" cy="28" r="2" fill="currentColor" opacity="0.3" />
          {/* Base line */}
          <line x1="25" y1="85" x2="95" y2="85" stroke="currentColor" strokeWidth="1" opacity="0.1" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
          <circle cx="60" cy="60" r="56" stroke="currentColor" strokeWidth="1" opacity="0.1" />
          <circle cx="60" cy="60" r="30" stroke="currentColor" strokeWidth="1" opacity="0.08" />
          {/* Generic star pattern */}
          <circle cx="60" cy="35" r="3" fill="currentColor" opacity="0.4" />
          <circle cx="40" cy="55" r="2" fill="currentColor" opacity="0.3" />
          <circle cx="80" cy="55" r="2" fill="currentColor" opacity="0.3" />
          <circle cx="45" cy="78" r="2.5" fill="currentColor" opacity="0.35" />
          <circle cx="75" cy="78" r="2.5" fill="currentColor" opacity="0.35" />
          <line x1="60" y1="35" x2="40" y2="55" stroke="currentColor" strokeWidth="0.8" opacity="0.15" />
          <line x1="60" y1="35" x2="80" y2="55" stroke="currentColor" strokeWidth="0.8" opacity="0.15" />
          <line x1="40" y1="55" x2="45" y2="78" stroke="currentColor" strokeWidth="0.8" opacity="0.15" />
          <line x1="80" y1="55" x2="75" y2="78" stroke="currentColor" strokeWidth="0.8" opacity="0.15" />
          <line x1="45" y1="78" x2="75" y2="78" stroke="currentColor" strokeWidth="0.8" opacity="0.15" />
        </svg>
      );
  }
}

const categoryGradients: Record<string, { from: string; to: string }> = {
  OBSERVATION: { from: "#1a1a2e", to: "#16213e" },
  WORKSHOP: { from: "#1a2332", to: "#1e3a4f" },
  LECTURE: { from: "#1a1e2e", to: "#252a3a" },
  STARGAZING: { from: "#0d1117", to: "#161b22" },
  MEETUP: { from: "#1e2028", to: "#262a34" },
  OTHER: { from: "#1a1c22", to: "#22252e" },
};

export function getCategoryGradient(category: string) {
  return categoryGradients[category] ?? categoryGradients.OTHER;
}
