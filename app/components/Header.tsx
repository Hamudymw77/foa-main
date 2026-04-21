"use client";

import { Trophy, Menu, X, Home, BarChart2, ArrowRightLeft } from "lucide-react";
import { useState } from "react";
import Link from 'next/link';

interface HeaderProps {
  showStatistics?: boolean;
  setShowStatistics?: (show: boolean) => void;
}

export function Header({ 
  showStatistics, 
  setShowStatistics, 
}: HeaderProps = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass mb-8 border-b-0 shadow-lg">
      <div className="container mx-auto px-2 md:px-8 h-16 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 cursor-pointer group min-h-[48px] active:scale-95 transition-transform duration-150">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-lg opacity-40 rounded-full group-hover:opacity-60 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-2 md:p-2.5 rounded-xl shadow-lg transform group-hover:scale-105 transition-transform duration-300">
              <Trophy className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
          </div>
          <h1 className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-extrabold tracking-tight select-none flex flex-col leading-none">
            <span className="text-xs text-blue-400 uppercase tracking-[0.2em]">Premier League</span>
            <span>
              <span className="text-white">KICK</span>
              <span className="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">GOAL</span>
            </span>
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1.5 rounded-full border border-white/5 backdrop-blur-sm" aria-label="Primary">
          <Link 
            href="/"
            className="px-6 py-2 rounded-full text-sm font-bold text-secondary hover:text-foreground hover:bg-white/10 transition-all duration-300 min-h-[48px] min-w-[48px] flex items-center justify-center gap-2 active:scale-95 transition-transform duration-150"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          <Link 
            href="/stats"
            className="px-6 py-2 rounded-full text-sm font-bold text-secondary hover:text-foreground hover:bg-white/10 transition-all duration-300 min-h-[48px] min-w-[48px] flex items-center justify-center gap-2 active:scale-95 transition-transform duration-150"
          >
            <BarChart2 className="w-4 h-4" />
            Stats
          </Link>
          <Link 
            href="/transfers"
            className="px-6 py-2 rounded-full text-sm font-bold text-secondary hover:text-foreground hover:bg-white/10 transition-all duration-300 min-h-[48px] min-w-[48px] flex items-center justify-center gap-2 active:scale-95 transition-transform duration-150"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Transfers
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 rounded-md text-secondary hover:text-foreground transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center active:scale-95 transition-transform duration-150"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="flex md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-b border-white/10 shadow-2xl animate-fade-in">
          <div className="flex flex-col p-4 gap-2">
            <Link 
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="text-left text-lg font-bold text-secondary hover:text-primary hover:bg-white/5 p-3 rounded-lg transition-all flex items-center gap-3 min-h-[48px] active:scale-95 transition-transform duration-150"
            >
              <Home className="w-5 h-5" />
              Home
            </Link>
            <Link 
              href="/stats"
              onClick={() => setIsMenuOpen(false)}
              className="text-left text-lg font-bold text-secondary hover:text-primary hover:bg-white/5 p-3 rounded-lg transition-all flex items-center gap-3 min-h-[48px] active:scale-95 transition-transform duration-150"
            >
              <BarChart2 className="w-5 h-5" />
              Stats
            </Link>
            <Link 
              href="/transfers"
              onClick={() => setIsMenuOpen(false)}
              className="text-left text-lg font-bold text-secondary hover:text-primary hover:bg-white/5 p-3 rounded-lg transition-all flex items-center gap-3 min-h-[48px] active:scale-95 transition-transform duration-150"
            >
              <ArrowRightLeft className="w-5 h-5" />
              Transfers
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
