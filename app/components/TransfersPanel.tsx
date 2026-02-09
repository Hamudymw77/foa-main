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
      default: return 'text-slate-400 bg-slate-700/30 border-slate-600';
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
        <div className="bg-slate-800 rounded-xl shadow-xl p-6 mb-8 animate-pulse">
            <span className="sr-only">Loading transfers...</span>
            <div className="h-8 bg-slate-700 w-1/3 mb-6 rounded"></div>
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-slate-700 rounded"></div>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <TransferStats transfers={transfers} />
      
      <div className="bg-slate-800 rounded-xl shadow-xl mb-8 border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700 bg-slate-800/95 backdrop-blur">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                      <ArrowRightLeft className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                      <h2 className="text-2xl font-bold text-white">Transfers 25/26</h2>
                      <p className="text-slate-400 text-sm">Premier League Winter Window</p>
                  </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
                <button 
                  onClick={handleExportJSON}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <FileJson className="w-4 h-4" />
                  JSON
                </button>
              </div>
          </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search player, club..." 
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="relative min-w-[200px]">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option value="all">All Types</option>
                    <option value="permanent">Permanent</option>
                    <option value="loan">Loan</option>
                    <option value="free">Free Transfer</option>
                </select>
            </div>
        </div>
      </div>

      {/* List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-slate-400 text-sm uppercase font-semibold">
                <tr>
                    <th className="px-6 py-4">Player</th>
                    <th className="px-6 py-4">From / To</th>
                    <th className="px-6 py-4">Fee & Contract</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Type</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
                {paginatedTransfers.length > 0 ? (
                    paginatedTransfers.map((transfer) => (
                        <tr key={transfer.id} className="hover:bg-slate-700/30 transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-bold text-white text-lg">{transfer.player}</div>
                                <div className="text-sm text-slate-400">{transfer.position} • {transfer.age} yrs</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <span className="text-slate-500 w-12">From:</span>
                                    <span className="font-medium">{transfer.oldClub}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-white mt-1">
                                    <span className="text-slate-500 w-12">To:</span>
                                    <span className="font-bold text-purple-400">{transfer.newClub}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5 font-bold text-green-400 text-lg">
                                    {formatFee(transfer.fee, transfer.feeDisplay)}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                    {transfer.feeEUR ? `€${(transfer.feeEUR/1000000).toFixed(1)}M` : ''}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                    {transfer.contractLength}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-300 text-sm">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-500" />
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
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                            No transfers found matching your criteria.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
          <div className="p-4 border-t border-slate-700 flex justify-between items-center bg-slate-800/50">
            <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-400 hover:text-white"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-slate-400 font-medium">
                Page <span className="text-white">{currentPage}</span> of {totalPages}
            </span>
            <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-400 hover:text-white"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
          </div>
      )}
    </div>
  </div>
  )
}
