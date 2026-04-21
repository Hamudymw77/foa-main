"use client";

import { Github, Twitter, Facebook, Instagram, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="glass-card border-t border-white/10 mt-12 pt-12 pb-8">
      <div className="container mx-auto px-2 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-extrabold tracking-tight mb-4">
              <span className="text-foreground">KICK</span>
              <span className="text-accent">GOAL</span>
            </h3>
            <p className="text-secondary text-sm leading-relaxed mb-4">
              The ultimate destination for Premier League statistics, live scores, and detailed match analysis. Built for fans, by fans.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-secondary hover:text-foreground transition-colors min-w-[48px] min-h-[48px] inline-flex items-center justify-center active:scale-95 transition-transform duration-150" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-secondary hover:text-foreground transition-colors min-w-[48px] min-h-[48px] inline-flex items-center justify-center active:scale-95 transition-transform duration-150" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-secondary hover:text-foreground transition-colors min-w-[48px] min-h-[48px] inline-flex items-center justify-center active:scale-95 transition-transform duration-150" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-secondary hover:text-foreground transition-colors min-w-[48px] min-h-[48px] inline-flex items-center justify-center active:scale-95 transition-transform duration-150" aria-label="GitHub">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="col-span-1">
            <h4 className="text-foreground font-bold mb-4 uppercase text-sm tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-secondary hover:text-accent text-sm transition-colors min-h-[48px] md:min-h-0 flex items-center py-2 md:py-0 active:scale-95 transition-transform duration-150">Home</a></li>
              <li><a href="#" className="text-secondary hover:text-accent text-sm transition-colors min-h-[48px] md:min-h-0 flex items-center py-2 md:py-0 active:scale-95 transition-transform duration-150">Live Scores</a></li>
              <li><a href="#" className="text-secondary hover:text-accent text-sm transition-colors min-h-[48px] md:min-h-0 flex items-center py-2 md:py-0 active:scale-95 transition-transform duration-150">League Table</a></li>
              <li><a href="#" className="text-secondary hover:text-accent text-sm transition-colors min-h-[48px] md:min-h-0 flex items-center py-2 md:py-0 active:scale-95 transition-transform duration-150">Top Scorers</a></li>
              <li><a href="#" className="text-secondary hover:text-accent text-sm transition-colors min-h-[48px] md:min-h-0 flex items-center py-2 md:py-0 active:scale-95 transition-transform duration-150">News</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h4 className="text-foreground font-bold mb-4 uppercase text-sm tracking-wider">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-secondary hover:text-accent text-sm transition-colors min-h-[48px] md:min-h-0 flex items-center py-2 md:py-0 active:scale-95 transition-transform duration-150">Privacy Policy</a></li>
              <li><a href="#" className="text-secondary hover:text-accent text-sm transition-colors min-h-[48px] md:min-h-0 flex items-center py-2 md:py-0 active:scale-95 transition-transform duration-150">Terms of Service</a></li>
              <li><a href="#" className="text-secondary hover:text-accent text-sm transition-colors min-h-[48px] md:min-h-0 flex items-center py-2 md:py-0 active:scale-95 transition-transform duration-150">Cookie Policy</a></li>
              <li><a href="#" className="text-secondary hover:text-accent text-sm transition-colors min-h-[48px] md:min-h-0 flex items-center py-2 md:py-0 active:scale-95 transition-transform duration-150">Contact Us</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-1 md:col-span-1">
            <h4 className="text-foreground font-bold mb-4 uppercase text-sm tracking-wider">Newsletter</h4>
            <p className="text-secondary text-sm mb-4">Subscribe to get the latest transfer news and match updates.</p>
            <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white/5 border border-white/10 text-foreground text-sm rounded-lg px-4 py-3 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent placeholder:text-secondary"
              />
              <button className="bg-accent hover:bg-accent/80 text-white font-bold py-3 px-4 rounded-lg transition-colors text-sm min-h-[48px] active:scale-95 transition-transform duration-150">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-secondary text-sm text-center md:text-left">
            © {new Date().getFullYear()} KICKGOAL. All rights reserved. Data provided by FixtureDownload & PL.
          </p>
          <div className="flex items-center gap-2 text-secondary text-sm">
            <Mail className="w-4 h-4" />
            <span>support@kickgoal.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
