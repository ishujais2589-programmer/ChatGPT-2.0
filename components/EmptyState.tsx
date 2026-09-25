import React, { useState } from 'react';
import {
  Code,
  GraduationCap,
  Mail,
  Sparkles,
  Calculator,
  Briefcase,
  HelpCircle,
  Lightbulb,
  BookOpen
} from 'lucide-react';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

type CategoryType = 'all' | 'coding' | 'math' | 'science' | 'writing' | 'business' | 'general';

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectPrompt }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');

  const allSuggestions = [
    {
      categoryType: 'coding',
      icon: Code,
      category: 'Coding & Dev',
      prompt: 'Write a Python script to fetch real-time weather and parse JSON data cleanly.',
    },
    {
      categoryType: 'math',
      icon: Calculator,
      category: 'Math & Logic',
      prompt: 'Solve the integral of e^(2x) * sin(3x) dx step-by-step with explanation.',
    },
    {
      categoryType: 'science',
      icon: GraduationCap,
      category: 'Science & Physics',
      prompt: 'Explain quantum entanglement and superposition in simple, intuitive terms.',
    },
    {
      categoryType: 'writing',
      icon: Mail,
      category: 'Writing & Email',
      prompt: 'Draft a polite and persuasive email negotiating a project deadline extension.',
    },
    {
      categoryType: 'business',
      icon: Briefcase,
      category: 'Business & Strategy',
      prompt: 'Create a go-to-market strategy for a SaaS AI startup targeting SMBs.',
    },
    {
      categoryType: 'general',
      icon: BookOpen,
      category: 'General Knowledge',
      prompt: 'Explain the historical causes and geopolitical impact of the Renaissance in Europe.',
    },
  ];

  const filteredSuggestions = activeCategory === 'all'
    ? allSuggestions.slice(0, 4)
    : allSuggestions.filter((s) => s.categoryType === activeCategory);

  const categories: Array<{ id: CategoryType; label: string }> = [
    { id: 'all', label: 'All Types' },
    { id: 'coding', label: 'Coding' },
    { id: 'math', label: 'Math' },
    { id: 'science', label: 'Science' },
    { id: 'writing', label: 'Writing' },
    { id: 'business', label: 'Business' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto px-4 py-8 text-center animate-in fade-in duration-300">
      {/* ChatGPT Brand Icon */}
      <div className="relative mb-5">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-500/10 dark:ring-emerald-500/20">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-neutral-900 text-white text-[10px] font-mono border border-neutral-700">
          AI
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
        What can I help with today?
      </h1>
      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
        Answers all types of questions—coding, mathematics, science, writing, business, logic, and everyday topics.
      </p>

      {/* Category Pills */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap mt-6 mb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold'
                : 'bg-neutral-100 dark:bg-[#282828] text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-[#323232]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-4 text-left">
        {filteredSuggestions.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => onSelectPrompt(item.prompt)}
              className="group flex flex-col justify-between p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-[#262626]/70 hover:bg-neutral-50 dark:hover:bg-[#2e2e2e] hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all text-left shadow-2xs hover:shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Icon className="w-4 h-4" />
                <span>{item.category}</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 font-medium line-clamp-2 leading-relaxed">
                {item.prompt}
              </p>
            </button>
          );
        })}
      </div>

      {/* Website Creator attribution badge */}
      <div className="mt-8 flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/80 dark:bg-[#1e1e1e]/60 text-xs text-neutral-500 dark:text-neutral-400">
        <span>This website is made by</span>
        <span className="font-semibold text-neutral-800 dark:text-neutral-200">Ishan Jaiswal</span>
      </div>
    </div>
  );
};
