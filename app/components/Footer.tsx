"use client";

import { Github, Twitter, Facebook, Instagram, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="glass-card border-t border-white/10 mt-12 pt-12 pb-8">
      <div className="container mx-auto px-4 md:px-8">
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
              <a href="#" className="text-secondary hover:text-foreground transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-secondary hover:text-foreground transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-secondary hover:text-foreground transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-secondary hover:text-foreground transition-colors" aria-label="GitHub">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="col-span-1">
            <h4 className="text-foreground font-bold mb-4 uppercase text-sm tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-secondary hover:text-accent text-sm transition-colors">Home</a></li>
              <li><a href="#" className="text-secondary hover:text-accent text-sm transition-colors">Live Scores</a></li>
              <li><a href="#" className="text-secondary hover:text-accent text-sm transition-colors">League Table</a></li>
              <li><a href="#" className="text-secondary hover:text-accent text-sm transition-colors">Top Scorers</a></li>
              <li><a href="#" className="text-secondary hover:text-accent text-sm transition-colors">News</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h4 className="text-foreground font-bold mb-4 uppercase text-sm tracking-wider">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-secondary hover:text-accent text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-secondary hover:text-accent text-sm transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-secondary hover:text-accent text-sm transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="text-secondary hover:text-accent text-sm transition-colors">Contact Us</a></li>
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
                className="bg-white/5 border border-white/10 text-foreground text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent placeholder:text-secondary"
              />
              <button className="bg-accent hover:bg-accent/80 text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm">
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
