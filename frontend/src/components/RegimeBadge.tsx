interface RegimeBadgeProps {
  regime: string;
}

export default function RegimeBadge({ regime }: RegimeBadgeProps) {
  const getColor = () => {
    if (regime.includes('Trend↑') || regime.includes('TREND_UP')) {
      return 'bg-green-500/20 text-green-400 border-green-500/50';
    }
    if (regime.includes('Trend↓') || regime.includes('TREND_DOWN')) {
      return 'bg-red-500/20 text-red-400 border-red-500/50';
    }
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium border ${getColor()}`}
    >
      {regime}
    </span>
  );
}

