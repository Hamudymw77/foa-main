"use client";

import { Trophy, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass mb-8 border-b-0 shadow-lg">
      <div className="container mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1.5 rounded-full border border-white/5 backdrop-blur-sm" aria-label="Primary">
          {[
            { label: "Table", target: "standings" },
            { label: "Matches", target: "matches" },
            { label: "Stats", target: "stats" },
          ].map((item) => (
            <button 
              key={item.label}
              type="button"
              onClick={() => scrollToSection(item.target)} 
              className="px-6 py-2 rounded-full text-sm font-bold text-secondary hover:text-foreground hover:bg-white/10 transition-all duration-300 min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
            <button 
              type="button"
              className="bg-accent text-slate-900 hover:bg-amber-300 text-sm font-extrabold py-2.5 px-7 rounded-full transition-all shadow-lg shadow-amber-300/30 hover:shadow-amber-300/50 transform hover:-translate-y-0.5 min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Live Scores - go to matches section"
              onClick={() => scrollToSection('matches')}
            >
                Live Scores
            </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 rounded-md text-secondary hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-b border-white/10 shadow-2xl animate-fade-in">
          <div className="flex flex-col p-4 gap-2">
            {[
              { label: "Table", target: "standings" },
              { label: "Matches", target: "matches" },
              { label: "Stats", target: "stats" },
            ].map((item) => (
                <button 
                    key={item.label}
                    type="button"
                    onClick={() => scrollToSection(item.target)} 
                    className="text-left text-lg font-bold text-secondary hover:text-primary hover:bg-white/5 p-3 rounded-lg transition-all"
                >
                    {item.label}
                </button>
            ))}
            <button 
              type="button"
              onClick={() => scrollToSection('matches')}
              className="bg-accent text-slate-900 font-extrabold py-3 px-4 rounded-lg text-center shadow-lg mt-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Live Scores
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
