import React, { useRef, useEffect, useState } from 'react';
import {
  ArrowUp,
  Square,
  Mic,
  MicOff,
  Sparkles,
  Paperclip
} from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  onSend: (text: string) => void;
  isLoading: boolean;
  onStop: () => void;
  hasMessages: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  isLoading,
  onStop,
  hasMessages,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, [input]);

  // Initialize SpeechRecognition if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [setInput]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSend(input);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) {
      onStop();
      return;
    }
    if (input.trim()) {
      onSend(input);
    }
  };

  // Follow-up suggestion pills
  const followUpChips = [
    'Explain in simpler terms',
    'Provide a code example',
    'Summarize key takeaways',
    'What are potential edge cases?',
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-4">
      {/* Quick follow-up chip pills */}
      {hasMessages && !isLoading && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none text-xs">
          {followUpChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => onSend(chip)}
              className="shrink-0 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-[#262626]/60 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#2f2f2f] hover:border-emerald-500/30 transition-colors cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Main input container box */}
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col rounded-3xl bg-neutral-100 dark:bg-[#2f2f2f] border border-neutral-200 dark:border-neutral-700/60 shadow-xs focus-within:border-neutral-400 dark:focus-within:border-neutral-500 transition-all"
      >
        <div className="flex items-end px-3 py-2">
          {/* Voice to text button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-full transition-colors cursor-pointer shrink-0 mr-1.5 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
            title={isListening ? 'Stop listening' : 'Dictate with voice'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={isListening ? 'Listening to speech...' : 'Message ChatGPT...'}
            className="flex-1 max-h-[200px] py-1.5 bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none resize-none leading-relaxed"
          />

          {/* Send / Stop button */}
          <div className="shrink-0 ml-2">
            {isLoading ? (
              <button
                type="button"
                onClick={onStop}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                title="Stop generating"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all cursor-pointer ${
                  input.trim()
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 shadow-xs'
                    : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed opacity-50'
                }`}
                title="Send message"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Legal & privacy footer */}
      <div className="text-center mt-2 flex flex-col items-center justify-center gap-0.5">
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
          ChatGPT can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
};
