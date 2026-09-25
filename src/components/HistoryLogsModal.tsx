import React, { useState, useMemo } from 'react';
import { Conversation } from '../types';
import { 
  X, 
  Search, 
  Trash2, 
  Download, 
  MessageSquare, 
  Calendar, 
  FileText, 
  Check, 
  Database,
  ExternalLink
} from 'lucide-react';

interface HistoryLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onClearAllHistory: () => void;
}

export const HistoryLogsModal: React.FC<HistoryLogsModalProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  onClearAllHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedExport, setCopiedExport] = useState(false);

  // Compute log statistics
  const stats = useMemo(() => {
    let totalMessages = 0;
    let userMessages = 0;
    let assistantMessages = 0;

    conversations.forEach((conv) => {
      totalMessages += conv.messages.length;
      conv.messages.forEach((msg) => {
        if (msg.role === 'user') userMessages++;
        else assistantMessages++;
      });
    });

    return {
      totalChats: conversations.length,
      totalMessages,
      userMessages,
      assistantMessages,
    };
  }, [conversations]);

  // Filtered conversations based on search
  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    const lower = searchTerm.toLowerCase();
    return conversations.filter((c) => {
      if (c.title.toLowerCase().includes(lower)) return true;
      return c.messages.some((m) => m.content.toLowerCase().includes(lower));
    });
  }, [conversations, searchTerm]);

  // Export all chat logs as JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(conversations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `chatgpt-history-logs-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export all chat logs as Markdown
  const handleExportMarkdown = () => {
    let md = `# ChatGPT Message History Logs\nExported on: ${new Date().toLocaleString()}\n\n`;
    conversations.forEach((conv, index) => {
      md += `## ${index + 1}. ${conv.title}\n`;
      md += `*Created: ${new Date(conv.createdAt).toLocaleString()}*\n\n`;
      conv.messages.forEach((msg) => {
        const sender = msg.role === 'user' ? '👤 User' : '🤖 ChatGPT';
        md += `### ${sender} (${new Date(msg.timestamp).toLocaleTimeString()})\n\n${msg.content}\n\n`;
      });
      md += `---\n\n`;
    });

    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(md);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `chatgpt-history-logs-${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-3xl max-h-[85vh] rounded-2xl bg-white shadow-2xl border border-neutral-200 dark:bg-[#212121] dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Message History Logs</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                View, audit, search, export, or clear saved conversation logs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-neutral-50/70 dark:bg-[#1a1a1a] border-b border-neutral-200 dark:border-neutral-800 text-center">
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#262626] border border-neutral-200 dark:border-neutral-800">
            <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Conversations</div>
            <div className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mt-0.5">{stats.totalChats}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#262626] border border-neutral-200 dark:border-neutral-800">
            <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Total Messages</div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.totalMessages}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#262626] border border-neutral-200 dark:border-neutral-800">
            <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">User Questions</div>
            <div className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mt-0.5">{stats.userMessages}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#262626] border border-neutral-200 dark:border-neutral-800">
            <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">AI Answers</div>
            <div className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mt-0.5">{stats.assistantMessages}</div>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search history logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#2a2a2a] placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleExportMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Export as Markdown"
            >
              <FileText className="w-3.5 h-3.5 text-neutral-500" />
              Markdown
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Export as JSON"
            >
              <Download className="w-3.5 h-3.5 text-neutral-500" />
              JSON
            </button>
            {conversations.length > 0 && (
              <button
                onClick={() => {
                  onClearAllHistory();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All Logs
              </button>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-400">
              <MessageSquare className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No conversation history logs found.</p>
              {searchTerm && <p className="text-xs text-neutral-500 mt-1">Try another search term.</p>}
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const lastMessage = conv.messages[conv.messages.length - 1];

              return (
                <div
                  key={conv.id}
                  className={`pt-3 first:pt-0 group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl transition-colors ${
                    isActive 
                      ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30' 
                      : 'hover:bg-neutral-50 dark:hover:bg-[#262626]'
                  }`}
                >
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => {
                      onSelectConversation(conv.id);
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate text-neutral-900 dark:text-neutral-100">
                        {conv.title}
                      </span>
                      {isActive && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-1">
                      {lastMessage ? lastMessage.content : 'No messages'}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-1.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(conv.updatedAt).toLocaleDateString()} at {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>•</span>
                      <span>{conv.messages.length} message{conv.messages.length === 1 ? '' : 's'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => {
                        onSelectConversation(conv.id);
                        onClose();
                      }}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-emerald-600 hover:bg-neutral-100 dark:hover:bg-neutral-700/60 transition-colors"
                      title="Open conversation"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteConversation(conv.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Delete this log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#1a1a1a] flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span>Logs are stored securely in your browser's local storage.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#262626] text-neutral-700 dark:text-neutral-200 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
