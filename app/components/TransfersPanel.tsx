"use client"
import { useState, useMemo } from 'react';
import { Transfer } from "@/types";
import { ArrowRightLeft, Search, Filter, Calendar, ChevronLeft, ChevronRight, Download, FileJson } from "lucide-react";
import { TransferStats } from './TransferStats';

interface TransfersPanelProps {
  transfers: Transfer[];
  isLoading: boolean;
}

export function TransfersPanel({ transfers, isLoading }: TransfersPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredTransfers = useMemo(() => {
    return transfers.filter(t => {
      const matchesSearch = 
        t.player.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.oldClub.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.newClub.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === "all" || t.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [transfers, searchTerm, typeFilter]);

  const totalPages = Math.ceil(filteredTransfers.length / itemsPerPage);
  const paginatedTransfers = filteredTransfers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatFee = (fee: number, display: string) => {
    if (fee === 0) return "Free";
    return display;
  };

  const getTransferTypeColor = (type: string) => {
    switch (type) {
      case 'permanent': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'loan': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'free': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-secondary bg-white/5 border-white/10';
    }
  };

  const handleExportCSV = () => {
    const headers = ['Player', 'Position', 'Age', 'From', 'To', 'Fee (GBP)', 'Fee (EUR)', 'Date', 'Type', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...filteredTransfers.map(t => [
        `"${t.player}"`,
        `"${t.position}"`,
        t.age,
        `"${t.oldClub}"`,
        `"${t.newClub}"`,
        t.fee,
        t.feeEUR || 0,
        `"${t.date}"`,
        `"${t.type}"`,
        `"${t.notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'transfers_2025_26.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExportJSON = () => {
    const jsonContent = JSON.stringify(filteredTransfers, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'transfers_2025_26.json');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
        <div className="glass-card p-6 mb-8 animate-pulse">
            <span className="sr-only">Loading transfers...</span>
            <div className="h-8 bg-white/10 w-1/3 mb-6 rounded"></div>
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-white/5 rounded"></div>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <TransferStats transfers={transfers} />
      
      <div className="glass-card mb-8 overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                      <ArrowRightLeft className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                      <h2 className="text-2xl font-bold text-foreground">Transfers 25/26</h2>
                      <p className="text-secondary text-sm">Premier League Winter Window</p>
                  </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-foreground rounded-lg transition-colors text-sm font-medium min-h-[44px] min-w-[44px]"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
                <button 
                  onClick={handleExportJSON}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-foreground rounded-lg transition-colors text-sm font-medium min-h-[44px] min-w-[44px]"
                >
                  <FileJson className="w-4 h-4" />
                  JSON
                </button>
              </div>
          </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                <input 
                    type="text" 
                    placeholder="Search player, club..." 
                    className="w-full bg-white/5 border border-white/10 text-foreground rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent placeholder-secondary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="relative min-w-[200px]">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                <select 
                    className="w-full bg-white/5 border border-white/10 text-foreground rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent appearance-none cursor-pointer"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option value="all" className="bg-background text-foreground">All Types</option>
                    <option value="permanent" className="bg-background text-foreground">Permanent</option>
                    <option value="loan" className="bg-background text-foreground">Loan</option>
                    <option value="free" className="bg-background text-foreground">Free Transfer</option>
                </select>
            </div>
        </div>
      </div>

      {/* List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead className="bg-white/5 text-secondary text-sm uppercase font-semibold">
                <tr>
                    <th className="px-6 py-4">Player</th>
                    <th className="px-6 py-4">From / To</th>
                    <th className="px-6 py-4">Fee & Contract</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Type</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {paginatedTransfers.length > 0 ? (
                    paginatedTransfers.map((transfer) => (
                        <tr key={transfer.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-bold text-foreground text-lg">{transfer.player}</div>
                                <div className="text-sm text-secondary">{transfer.position} • {transfer.age} yrs</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <span className="text-secondary w-12">From:</span>
                                    <span className="font-medium">{transfer.oldClub}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-foreground mt-1">
                                    <span className="text-secondary w-12">To:</span>
                                    <span className="font-bold text-accent">{transfer.newClub}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5 font-bold text-green-400 text-lg">
                                    {formatFee(transfer.fee, transfer.feeDisplay)}
                                </div>
                                <div className="text-xs text-secondary mt-0.5">
                                    {transfer.feeEUR ? `€${(transfer.feeEUR/1000000).toFixed(1)}M` : ''}
                                </div>
                                <div className="text-xs text-secondary mt-0.5">
                                    {transfer.contractLength}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-secondary text-sm">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-secondary" />
                                    {transfer.date}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getTransferTypeColor(transfer.type)}`}>
                                    {transfer.type.toUpperCase()}
                                </span>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-secondary">
                            No transfers found matching your criteria.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex justify-between items-center bg-white/5">
            <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-secondary hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-secondary font-medium">
                Page <span className="text-foreground">{currentPage}</span> of {totalPages}
            </span>
            <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-secondary hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
          </div>
      )}
    </div>
  </div>
  )
}
