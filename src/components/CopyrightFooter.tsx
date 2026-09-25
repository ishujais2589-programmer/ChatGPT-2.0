import React from 'react';
import { Heart, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';

export const CopyrightFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="w-full shrink-0 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-100/70 dark:bg-[#1a1a1a]/80 backdrop-blur-md py-2.5 px-4 z-10 transition-colors"
      role="contentinfo"
      aria-label="Copyright and creator information"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        {/* Left side copyright notice */}
        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
              ©
            </span>
            {currentYear} ChatGPT AI Assistant
          </span>
          <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">•</span>
          <span className="text-neutral-500 dark:text-neutral-400 hidden sm:inline">
            All rights reserved
          </span>
        </div>

        {/* Creator attribution copyright box */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#252525] border border-neutral-200/90 dark:border-neutral-700/60 shadow-2xs text-neutral-700 dark:text-neutral-300">
          <span className="text-neutral-500 dark:text-neutral-400">
            This website is made by
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 tracking-wide flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            Ishan Jaiswal
          </span>
        </div>
      </div>
    </footer>
  );
};
