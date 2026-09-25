import React, { useState, useMemo } from 'react';
import { marked } from 'marked';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-900 text-neutral-100 shadow-sm dark:border-neutral-800 dark:bg-[#181818]">
      <div className="flex items-center justify-between border-b border-neutral-700/50 bg-neutral-800/90 px-4 py-1.5 text-xs text-neutral-300 dark:bg-[#121212]">
        <span className="font-mono text-neutral-400 font-medium">
          {language || 'text'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-neutral-300 hover:bg-neutral-700/70 hover:text-white transition-colors cursor-pointer"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[0.875rem] font-mono leading-relaxed text-neutral-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isStreaming }) => {
  // Parse content into alternating text and code blocks
  const parts = useMemo(() => {
    const segments: Array<{ type: 'text' | 'code'; language?: string; code?: string; html?: string }> = [];
    const codeBlockRegex = /```([a-zA-Z0-9_\-+]*)\n([\s\S]*?)(?:```|$)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        const textSegment = content.slice(lastIndex, match.index);
        const parsed = marked.parse(textSegment, { breaks: true, gfm: true }) as string;
        segments.push({ type: 'text', html: parsed });
      }

      segments.push({
        type: 'code',
        language: match[1] || 'plaintext',
        code: match[2]?.replace(/\n$/, '') || '',
      });

      lastIndex = codeBlockRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      const remainingText = content.slice(lastIndex);
      const parsed = marked.parse(remainingText, { breaks: true, gfm: true }) as string;
      segments.push({ type: 'text', html: parsed });
    }

    return segments;
  }, [content]);

  if (!content) {
    return isStreaming ? <span className="cursor-blink" /> : null;
  }

  return (
    <div className="markdown-body">
      {parts.map((segment, idx) => {
        if (segment.type === 'code') {
          return (
            <CodeBlock
              key={idx}
              language={segment.language || 'text'}
              code={segment.code || ''}
            />
          );
        }
        return (
          <div
            key={idx}
            dangerouslySetInnerHTML={{ __html: segment.html || '' }}
          />
        );
      })}
      {isStreaming && <span className="cursor-blink text-emerald-500" />}
    </div>
  );
};
