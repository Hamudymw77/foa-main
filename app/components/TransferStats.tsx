import React from 'react';
import { Transfer } from '@/types';
import { TrendingUp, DollarSign, Users, Award } from 'lucide-react';

interface TransferStatsProps {
  transfers: Transfer[];
}

export function TransferStats({ transfers }: TransferStatsProps) {
  const stats = React.useMemo(() => {
    const totalSpent = transfers.reduce((acc, t) => acc + t.fee, 0);
    const totalEUR = transfers.reduce((acc, t) => acc + (t.feeEUR || 0), 0);
    
    const clubSpending: Record<string, number> = {};
    transfers.forEach(t => {
      if (t.type === 'permanent' || t.type === 'loan') {
        clubSpending[t.newClub] = (clubSpending[t.newClub] || 0) + t.fee;
      }
    });

    const topSpender = Object.entries(clubSpending).sort((a, b) => b[1] - a[1])[0] || ['None', 0];
    
    const highestFee = [...transfers].sort((a, b) => b.fee - a.fee)[0];
    
    const avgFee = transfers.filter(t => t.fee > 0).length > 0 
      ? totalSpent / transfers.filter(t => t.fee > 0).length 
      : 0;

    return {
      totalSpent,
      totalEUR,
      topSpender,
      highestFee,
      avgFee
    };
  }, [transfers]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `£${(amount / 1000000).toFixed(1)}M`;
    }
    return `£${(amount / 1000).toFixed(0)}k`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="glass-card p-6 rounded-xl transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-green-500/10 rounded-xl">
            <DollarSign className="w-6 h-6 text-green-500" />
          </div>
          <span className="text-secondary font-medium">Total Market Volume</span>
        </div>
        <div className="text-3xl font-bold text-foreground mb-1">{formatCurrency(stats.totalSpent)}</div>
        <div className="text-sm text-secondary">€{(stats.totalEUR / 1000000).toFixed(1)}M (EUR)</div>
      </div>

      <div className="glass-card p-6 rounded-xl transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <TrendingUp className="w-6 h-6 text-blue-500" />
          </div>
          <span className="text-secondary font-medium">Highest Transfer</span>
        </div>
        <div className="text-2xl font-bold text-foreground truncate mb-1" title={stats.highestFee?.player}>{stats.highestFee?.player || 'N/A'}</div>
        <div className="text-sm font-semibold text-blue-400">{formatCurrency(stats.highestFee?.fee || 0)}</div>
      </div>

      <div className="glass-card p-6 rounded-xl transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <Award className="w-6 h-6 text-purple-500" />
          </div>
          <span className="text-secondary font-medium">Top Spender</span>
        </div>
        <div className="text-2xl font-bold text-foreground truncate mb-1" title={stats.topSpender[0]}>{stats.topSpender[0]}</div>
        <div className="text-sm font-semibold text-purple-400">{formatCurrency(stats.topSpender[1])}</div>
      </div>

      <div className="glass-card p-6 rounded-xl transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-orange-500/10 rounded-xl">
            <Users className="w-6 h-6 text-orange-500" />
          </div>
          <span className="text-secondary font-medium">Average Fee</span>
        </div>
        <div className="text-3xl font-bold text-foreground mb-1">{formatCurrency(stats.avgFee)}</div>
        <div className="text-sm text-secondary">Per paid transfer</div>
      </div>
    </div>
  );
}
