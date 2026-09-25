/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message, ThemeMode } from './types';
import { Sidebar } from './components/Sidebar';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { EmptyState } from './components/EmptyState';
import { ClearConfirmModal } from './components/ClearConfirmModal';
import { HistoryLogsModal } from './components/HistoryLogsModal';
import { CopyrightFooter } from './components/CopyrightFooter';

const STORAGE_CONVERSATIONS_KEY = 'chatgpt_conversations_v1';
const STORAGE_THEME_KEY = 'chatgpt_theme_v1';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Apply theme to HTML root element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CONVERSATIONS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load conversations from localStorage:', e);
    }
    return [];
  });

  // Save conversations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to save conversations to localStorage:', e);
    }
  }, [conversations]);

  // Active conversation ID
  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_CONVERSATIONS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed[0].id;
      } catch (e) {
        // ignore
      }
    }
    return null;
  });

  // Current active conversation
  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const currentMessages = activeConversation?.messages || [];

  // Chat input and streaming state
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  // Sidebar responsive state
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
  });

  // Modals state
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isClearCurrentModalOpen, setIsClearCurrentModalOpen] = useState(false);
  const [isHistoryLogsModalOpen, setIsHistoryLogsModalOpen] = useState(false);

  // Ref to abort streaming request
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, streamingMessageId]);

  // Start a new chat
  const handleNewChat = () => {
    if (isLoading) {
      handleStopGenerating();
    }
    setActiveConversationId(null);
    setInput('');
  };

  // Select existing conversation
  const handleSelectConversation = (id: string) => {
    if (isLoading) {
      handleStopGenerating();
    }
    setActiveConversationId(id);
    setInput('');
  };

  // Delete a specific conversation
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Rename a conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  // Clear all message history logs
  const handleClearAllHistory = () => {
    if (isLoading) {
      handleStopGenerating();
    }
    setConversations([]);
    setActiveConversationId(null);
    localStorage.removeItem(STORAGE_CONVERSATIONS_KEY);
  };

  // Clear messages from current active chat
  const handleClearCurrentChat = () => {
    if (!activeConversationId) return;
    if (isLoading) {
      handleStopGenerating();
    }
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? { ...c, messages: [], updatedAt: Date.now() }
          : c
      )
    );
  };

  // Stop active generation
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setStreamingMessageId(null);
  };

  // Send a message to AI
  const handleSendMessage = async (textToSend: string, customHistory?: Message[]) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    setInput('');

    // Establish conversation ID and title
    let targetConvId = activeConversationId;
    let targetConversations = [...conversations];

    const userMessage: Message = {
      id: 'msg-' + Date.now() + '-user',
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    const assistantMessageId = 'msg-' + (Date.now() + 1) + '-assistant';
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now() + 1,
    };

    if (!targetConvId || !targetConversations.some((c) => c.id === targetConvId)) {
      // Create new conversation
      const newTitle = trimmed.length > 36 ? trimmed.slice(0, 36) + '...' : trimmed;
      const newConv: Conversation = {
        id: 'conv-' + Date.now(),
        title: newTitle,
        messages: [userMessage, initialAssistantMessage],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      targetConvId = newConv.id;
      targetConversations = [newConv, ...targetConversations];
      setConversations(targetConversations);
      setActiveConversationId(targetConvId);
    } else {
      // Append to existing conversation or use customHistory (for regenerate / edit)
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === targetConvId) {
            const baseMsgs = customHistory || c.messages;
            return {
              ...c,
              messages: [...baseMsgs, userMessage, initialAssistantMessage],
              updatedAt: Date.now(),
            };
          }
          return c;
        })
      );
    }

    // Prepare message history for backend API
    const activeConv = targetConversations.find((c) => c.id === targetConvId);
    const existingMessages = customHistory || activeConv?.messages || [];
    const messagesPayload = [
      ...existingMessages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: trimmed },
    ];

    setIsLoading(true);
    setStreamingMessageId(assistantMessageId);

    // Setup abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesPayload,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported in response body.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedContent = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data:')) {
            const jsonStr = trimmedLine.replace(/^data:\s*/, '');
            if (!jsonStr) continue;

            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                accumulatedContent += parsed.text;
                // Update assistant message content in state
                setConversations((prev) =>
                  prev.map((conv) => {
                    if (conv.id === targetConvId) {
                      return {
                        ...conv,
                        messages: conv.messages.map((m) =>
                          m.id === assistantMessageId
                            ? { ...m, content: accumulatedContent }
                            : m
                        ),
                      };
                    }
                    return conv;
                  })
                );
              }
            } catch (jsonErr) {
              console.warn('Failed to parse SSE chunk:', jsonErr);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Chat generation stopped by user.');
      } else {
        console.error('Chat error:', err);
        const errMsg =
          err?.message || 'Sorry, something went wrong while getting an answer. Please try again.';
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === targetConvId) {
              return {
                ...conv,
                messages: conv.messages.map((m) =>
                  m.id === assistantMessageId
                    ? {
                        ...m,
                        content:
                          m.content.trim().length > 0
                            ? m.content + `\n\n*[Connection interrupted: ${errMsg}]*`
                            : `⚠️ **Unable to complete request:** ${errMsg}`,
                      }
                    : m
                ),
              };
            }
            return conv;
          })
        );
      }
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
      abortControllerRef.current = null;
    }
  };

  // Regenerate assistant answer
  const handleRegenerate = (messageIndex: number) => {
    if (!activeConversation || isLoading) return;

    // Find the user message directly preceding this assistant response
    const targetUserMessage = activeConversation.messages[messageIndex - 1];
    if (!targetUserMessage || targetUserMessage.role !== 'user') return;

    // History before the user message
    const previousHistory = activeConversation.messages.slice(0, messageIndex - 1);

    handleSendMessage(targetUserMessage.content, previousHistory);
  };

  // Edit user message and re-run
  const handleEditMessage = (messageIndex: number, newContent: string) => {
    if (!activeConversation || isLoading) return;

    // History before this user message
    const previousHistory = activeConversation.messages.slice(0, messageIndex);

    handleSendMessage(newContent, previousHistory);
  };

  // Feedback like/dislike toggle
  const handleToggleLike = (messageId: string, liked: boolean) => {
    if (!activeConversationId) return;
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversationId) {
          return {
            ...c,
            messages: c.messages.map((m) => {
              if (m.id === messageId) {
                return {
                  ...m,
                  liked: liked ? !m.liked : false,
                  disliked: !liked ? !m.disliked : false,
                };
              }
              return m;
            }),
          };
        }
        return c;
      })
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#212121] text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Sidebar with ChatGPT styling */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onOpenClearConfirm={() => setIsClearAllModalOpen(true)}
        onOpenHistoryLogs={() => setIsHistoryLogsModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Chat Interface */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative overflow-hidden">
        {/* Chat Top Header */}
        <ChatHeader
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onNewChat={handleNewChat}
          onClearCurrentChat={() => setIsClearCurrentModalOpen(true)}
          onOpenHistoryLogs={() => setIsHistoryLogsModalOpen(true)}
          hasMessages={currentMessages.length > 0}
          theme={theme}
          onToggleTheme={toggleTheme}
          currentTitle={activeConversation?.title || 'New Chat'}
        />

        {/* Messages Feed or Empty State */}
        <div className="flex-1 overflow-y-auto">
          {currentMessages.length === 0 ? (
            <EmptyState onSelectPrompt={(prompt) => handleSendMessage(prompt)} />
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/40 pb-6">
              {currentMessages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isStreaming={message.id === streamingMessageId}
                  onRegenerate={
                    message.role === 'assistant'
                      ? () => handleRegenerate(index)
                      : undefined
                  }
                  onEditMessage={
                    message.role === 'user'
                      ? (newContent) => handleEditMessage(index, newContent)
                      : undefined
                  }
                  onToggleLike={(liked) => handleToggleLike(message.id, liked)}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={(text) => handleSendMessage(text)}
          isLoading={isLoading}
          onStop={handleStopGenerating}
          hasMessages={currentMessages.length > 0}
        />

        {/* Copyright Box at end of website */}
        <CopyrightFooter />
      </main>

      {/* Clear All History Confirmation Modal */}
      <ClearConfirmModal
        isOpen={isClearAllModalOpen}
        onClose={() => setIsClearAllModalOpen(false)}
        onConfirm={handleClearAllHistory}
        title="Clear all chat history logs?"
        description="This will permanently delete all conversation history logs from your browser. This action cannot be undone."
        confirmButtonText="Clear All History"
        isDestructive={true}
      />

      {/* Clear Current Chat Confirmation Modal */}
      <ClearConfirmModal
        isOpen={isClearCurrentModalOpen}
        onClose={() => setIsClearCurrentModalOpen(false)}
        onConfirm={handleClearCurrentChat}
        title="Clear current conversation?"
        description="This will erase all messages in this conversation. The conversation title will remain in your sidebar."
        confirmButtonText="Clear Messages"
        isDestructive={true}
      />

      {/* Message History Logs Inspector Modal */}
      <HistoryLogsModal
        isOpen={isHistoryLogsModalOpen}
        onClose={() => setIsHistoryLogsModalOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onClearAllHistory={handleClearAllHistory}
      />
    </div>
  );
}
