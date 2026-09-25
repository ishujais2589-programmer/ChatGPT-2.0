import React from 'react';
import { Sparkles, UserCheck, CheckCircle2 } from 'lucide-react';

export const CopyrightFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="w-full shrink-0 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-100/80 dark:bg-[#181818]/90 backdrop-blur-md py-3 px-4 z-10 transition-colors"
      role="contentinfo"
      aria-label="Copyright and creator information"
    >
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Left side copyright notice & capabilities */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-neutral-600 dark:text-neutral-400">
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
              ©
            </span>
            {currentYear} ChatGPT AI Assistant
          </span>
          <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">•</span>
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Answers all types of questions
          </span>
          <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">•</span>
          <span className="text-neutral-500 dark:text-neutral-400">All rights reserved</span>
        </div>

        {/* Creator attribution copyright box */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#232323] border border-neutral-200 dark:border-neutral-700/70 shadow-xs text-neutral-700 dark:text-neutral-200">
          <span className="text-neutral-500 dark:text-neutral-400 font-normal">
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
