import React from 'react';
import {
  PanelLeft,
  Moon,
  Sun,
  Eraser,
  Database,
  Plus,
  Share2,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { ThemeMode } from '../types';

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onClearCurrentChat: () => void;
  onOpenHistoryLogs: () => void;
  hasMessages: boolean;
  theme: ThemeMode;
  onToggleTheme: () => void;
  currentTitle: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  onNewChat,
  onClearCurrentChat,
  onOpenHistoryLogs,
  hasMessages,
  theme,
  onToggleTheme,
  currentTitle,
}) => {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-14 px-3 sm:px-4 bg-white/80 dark:bg-[#212121]/80 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 transition-colors">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        {/* Model Selector / Brand Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer select-none">
          <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">
            ChatGPT
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 font-medium">
            3.8 Flash
          </span>
        </div>
      </div>

      {/* Title preview in center on medium screens */}
      {hasMessages && (
        <div className="hidden lg:block max-w-sm truncate text-xs text-neutral-400 font-medium">
          {currentTitle}
        </div>
      )}

      {/* Right Action buttons */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Mobile New Chat */}
        <button
          onClick={onNewChat}
          className="sm:hidden p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="New Chat"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* History Logs Inspector button */}
        <button
          onClick={onOpenHistoryLogs}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
          title="Open Message History Logs"
        >
          <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">Logs</span>
        </button>

        {/* Clear Current Chat Messages button */}
        {hasMessages && (
          <button
            onClick={onClearCurrentChat}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
            title="Clear Current Chat"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        )}

        {/* Dark Mode Quick Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-neutral-700" />
          )}
        </button>
      </div>
    </header>
  );
};
