"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 p-3 bg-accent hover:bg-accent/90 text-slate-900 rounded-full shadow-lg shadow-accent/30 transition-all duration-300 z-50 animate-in fade-in zoom-in hover:scale-110 group min-w-[44px] min-h-[44px] flex items-center justify-center"
      aria-label="Back to top"
    >
      <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
    </button>
  );
}
