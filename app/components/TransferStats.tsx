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
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <span className="text-slate-400 text-sm">Total Market Volume</span>
        </div>
        <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalSpent)}</div>
        <div className="text-xs text-slate-500 mt-1">€{(stats.totalEUR / 1000000).toFixed(1)}M (EUR)</div>
      </div>

      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-slate-400 text-sm">Highest Transfer</span>
        </div>
        <div className="text-xl font-bold text-white truncate">{stats.highestFee?.player || 'N/A'}</div>
        <div className="text-xs text-blue-400 mt-1">{formatCurrency(stats.highestFee?.fee || 0)}</div>
      </div>

      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Award className="w-5 h-5 text-purple-500" />
          </div>
          <span className="text-slate-400 text-sm">Top Spender</span>
        </div>
        <div className="text-xl font-bold text-white truncate">{stats.topSpender[0]}</div>
        <div className="text-xs text-purple-400 mt-1">{formatCurrency(stats.topSpender[1])}</div>
      </div>

      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Users className="w-5 h-5 text-orange-500" />
          </div>
          <span className="text-slate-400 text-sm">Average Fee</span>
        </div>
        <div className="text-2xl font-bold text-white">{formatCurrency(stats.avgFee)}</div>
        <div className="text-xs text-slate-500 mt-1">Per paid transfer</div>
      </div>
    </div>
  );
}
