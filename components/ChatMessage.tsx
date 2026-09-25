import React, { useState } from 'react';
import { Message } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  Sparkles,
  Copy,
  Check,
  RotateCw,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  X
} from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onEditMessage?: (newContent: string) => void;
  onToggleLike?: (liked: boolean) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isStreaming = false,
  onRegenerate,
  onEditMessage,
  onToggleLike,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);

  // Copy full message
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  // Text to speech playback
  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner audio reading
    const cleanText = message.content.replace(/```[\s\S]*?```/g, 'Code block omitted.').replace(/[#*_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editText.trim() && onEditMessage) {
      onEditMessage(editText.trim());
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`py-5 px-3 sm:px-6 transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-neutral-50/50 dark:bg-[#1a1a1a]/40 border-y border-neutral-100 dark:border-neutral-800/40'
      }`}
    >
      <div className="max-w-3xl mx-auto flex items-start gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-semibold text-xs shadow-xs">
              U
            </div>
          ) : (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#10a37f] text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Message Content & Action Bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200">
              {isUser ? 'You' : 'ChatGPT'}
            </span>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* User message edit mode */}
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="mt-2 space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                className="w-full p-3 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#262626] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Save & Resubmit
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : isUser ? (
            <div className="text-[0.965rem] text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap leading-relaxed">
              {message.content}
            </div>
          ) : (
            <MarkdownRenderer content={message.content} isStreaming={isStreaming} />
          )}

          {/* Message Toolbar */}
          {!isEditing && (
            <div className="flex items-center gap-1.5 mt-3 pt-1 text-neutral-400 dark:text-neutral-500">
              {/* Copy */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs hover:bg-neutral-200/50 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                title="Copy message"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>

              {/* Text-To-Speech for assistant */}
              {!isUser && !isStreaming && (
                <button
                  onClick={handleSpeak}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                    isSpeaking
                      ? 'text-emerald-500 bg-emerald-500/10'
                      : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                  title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Read</span>
                    </>
                  )}
                </button>
              )}

              {/* Regenerate for assistant */}
              {!isUser && !isStreaming && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-xs hover:bg-neutral-200/50 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                  title="Regenerate response"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Regenerate</span>
                </button>
              )}

              {/* Thumbs up & down ratings for assistant */}
              {!isUser && !isStreaming && onToggleLike && (
                <>
                  <button
                    onClick={() => onToggleLike(true)}
                    className={`p-1 rounded-md text-xs transition-colors cursor-pointer ${
                      message.liked
                        ? 'text-emerald-500 bg-emerald-500/10'
                        : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200'
                    }`}
                    title="Good response"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onToggleLike(false)}
                    className={`p-1 rounded-md text-xs transition-colors cursor-pointer ${
                      message.disliked
                        ? 'text-red-500 bg-red-500/10'
                        : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200'
                    }`}
                    title="Bad response"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              {/* Edit prompt for user */}
              {isUser && onEditMessage && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-xs hover:bg-neutral-200/50 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                  title="Edit prompt"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Edit</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
