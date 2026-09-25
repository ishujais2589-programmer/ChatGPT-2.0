import React, { useState, useMemo } from 'react';
import { Conversation, ThemeMode } from '../types';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Sun,
  Moon,
  Laptop,
  Database,
  PanelLeftClose,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onOpenClearConfirm: () => void;
  onOpenHistoryLogs: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onOpenClearConfirm,
  onOpenHistoryLogs,
  theme,
  onToggleTheme,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Start inline editing
  const startEditing = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  // Save inline edit
  const saveTitle = (id: string, e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.stopPropagation();
    if (editingTitle.trim()) {
      onRenameConversation(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  // Group conversations by time
  const groupedConversations = useMemo(() => {
    const filtered = conversations.filter((c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const startOf7Days = startOfToday - 7 * 86400000;
    const startOf30Days = startOfToday - 30 * 86400000;

    const groups: {
      today: Conversation[];
      yesterday: Conversation[];
      previous7Days: Conversation[];
      previous30Days: Conversation[];
      older: Conversation[];
    } = {
      today: [],
      yesterday: [],
      previous7Days: [],
      previous30Days: [],
      older: [],
    };

    filtered.forEach((conv) => {
      const time = conv.updatedAt || conv.createdAt;
      if (time >= startOfToday) {
        groups.today.push(conv);
      } else if (time >= startOfYesterday) {
        groups.yesterday.push(conv);
      } else if (time >= startOf7Days) {
        groups.previous7Days.push(conv);
      } else if (time >= startOf30Days) {
        groups.previous30Days.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  }, [conversations, searchTerm]);

  const renderGroup = (title: string, list: Conversation[]) => {
    if (list.length === 0) return null;

    return (
      <div key={title} className="mb-4">
        <h4 className="px-3 mb-1.5 text-[11px] font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
          {title}
        </h4>
        <div className="space-y-0.5">
          {list.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const isEditing = conv.id === editingId;

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`group relative flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-neutral-200/80 text-neutral-900 font-medium dark:bg-[#2f2f2f] dark:text-neutral-100'
                    : 'text-neutral-700 hover:bg-neutral-200/50 dark:text-neutral-300 dark:hover:bg-[#262626]'
                }`}
              >
                {isEditing ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveTitle(conv.id, e);
                    }}
                    className="flex items-center gap-1.5 w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      autoFocus
                      className="w-full bg-white dark:bg-[#1a1a1a] text-xs px-2 py-1 rounded border border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="p-1 text-emerald-500 hover:text-emerald-600"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1 text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <MessageSquare className="w-4 h-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
                      <span className="truncate text-[13px]">{conv.title}</span>
                    </div>

                    {/* Actions on hover or active */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => startEditing(conv, e)}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-300/40 dark:hover:bg-neutral-700/50"
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conv.id);
                        }}
                        className="p-1 rounded text-neutral-400 hover:text-red-500 hover:bg-neutral-300/40 dark:hover:bg-neutral-700/50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col w-[260px] shrink-0 bg-[#f9f9f9] dark:bg-[#171717] border-r border-neutral-200 dark:border-neutral-800/80 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:-translate-x-full md:w-0 md:border-r-0 md:overflow-hidden'
        }`}
      >
        {/* Top Header & New Chat button */}
        <div className="p-3 pb-2 space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#10a37f] text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-neutral-900 dark:text-white">
                ChatGPT
              </span>
            </div>

            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
              title="Close sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onNewChat}
            className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-xl border border-neutral-200/80 dark:border-neutral-700/60 bg-white dark:bg-[#212121] text-neutral-800 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-[#2a2a2a] transition-colors shadow-2xs group"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:rotate-90 transition-transform duration-200" />
              <span>New chat</span>
            </div>
            <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
              ⌘N
            </span>
          </button>

          {/* Quick Search */}
          {conversations.length > 3 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-neutral-200/50 dark:bg-[#212121] text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2 py-1 select-none">
          {conversations.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400 dark:text-neutral-500">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-30" />
              No chat history yet.
            </div>
          ) : (
            <>
              {renderGroup('Today', groupedConversations.today)}
              {renderGroup('Yesterday', groupedConversations.yesterday)}
              {renderGroup('Previous 7 Days', groupedConversations.previous7Days)}
              {renderGroup('Previous 30 Days', groupedConversations.previous30Days)}
              {renderGroup('Older', groupedConversations.older)}
            </>
          )}
        </div>

        {/* Bottom actions & Settings */}
        <div className="p-2 space-y-1 border-t border-neutral-200 dark:border-neutral-800/80 bg-[#f9f9f9] dark:bg-[#171717]">
          {/* History logs inspector */}
          <button
            onClick={onOpenHistoryLogs}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-[#242424] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>History Logs & Export</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono">
              {conversations.length}
            </span>
          </button>

          {/* Clear message history logs */}
          {conversations.length > 0 && (
            <button
              onClick={onOpenClearConfirm}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear message history logs</span>
            </button>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-[#242424] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <span>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
            </div>
            <span className="text-[11px] text-neutral-400">
              Toggle
            </span>
          </button>

          {/* User profile item & Creator credit */}
          <div className="flex items-center justify-between gap-2 px-3 py-2 pt-2.5 rounded-xl text-xs text-neutral-800 dark:text-neutral-200 bg-neutral-200/40 dark:bg-[#1f1f1f]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-semibold text-xs shadow-2xs shrink-0">
                IJ
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold truncate">Ishan Jaiswal</span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">Creator & Developer</span>
              </div>
            </div>
            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
              Dev
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
