/**
 * Token Counter and Context Budget Estimator
 * Calibrated against standard BPE tokenizers (GPT-4 / Llama 3 / Claude)
 */

import { CharacterDataV2 } from '../types/sillytavern';

export function estimateTokens(text: string | null | undefined): number {
  if (!text || typeof text !== 'string') return 0;
  if (text.length === 0) return 0;

  // Normalize newlines
  const normalized = text.replace(/\r\n/g, '\n');

  // Match:
  // 1. Macros and tags like {{char}}, {{user}}, <START>
  // 2. Words (including contractions)
  // 3. Numbers
  // 4. Consecutive punctuation or individual special symbols
  // 5. Newlines
  const regex = /\{\{[^}]+\}\}|<[^>]+>|[A-Za-z]+(?:'[A-Za-z]+)?|\d+|[^\w\s]|\n+/g;
  const matches = normalized.match(regex);

  if (!matches) {
    return Math.ceil(normalized.length / 4);
  }

  let totalTokens = 0;
  for (const match of matches) {
    if (match.startsWith('\n')) {
      totalTokens += match.length;
    } else if (match.length > 10) {
      // Long compound words or URLs break into multiple subwords
      totalTokens += Math.ceil(match.length / 3.8);
    } else {
      totalTokens += 1;
    }
  }

  return Math.max(1, totalTokens);
}

export interface CardTokenBreakdown {
  description: number;
  personality: number;
  scenario: number;
  firstMessage: number;
  exampleDialogues: number;
  lorebook: number;
  systemPrompt: number;
  total: number;
  status: 'under' | 'optimal' | 'acceptable' | 'warning';
  percentageOfBudget: number; // based on 2048 soft limit
}

export const TARGET_BUDGET = 1600;
export const MAX_RECOMMENDED_BUDGET = 2200;

export function analyzeTokenBudget(data: Partial<CharacterDataV2>): CardTokenBreakdown {
  const description = estimateTokens(data.description);
  const personality = estimateTokens(data.personality);
  const scenario = estimateTokens(data.scenario);
  const firstMessage = estimateTokens(data.first_mes);
  const exampleDialogues = estimateTokens(data.mes_example);
  const systemPrompt = estimateTokens(data.system_prompt) + estimateTokens(data.post_history_instructions);

  let lorebook = 0;
  if (data.character_book?.entries) {
    for (const entry of data.character_book.entries) {
      if (entry.enabled) {
        lorebook += estimateTokens(entry.content) + estimateTokens(entry.keys.join(' '));
      }
    }
  }

  const total = description + personality + scenario + firstMessage + exampleDialogues + systemPrompt + lorebook;

  let status: 'under' | 'optimal' | 'acceptable' | 'warning';
  if (total < 600) {
    status = 'under';
  } else if (total <= TARGET_BUDGET) {
    status = 'optimal';
  } else if (total <= MAX_RECOMMENDED_BUDGET) {
    status = 'acceptable';
  } else {
    status = 'warning';
  }

  const percentageOfBudget = Math.min(100, Math.round((total / MAX_RECOMMENDED_BUDGET) * 100));

  return {
    description,
    personality,
    scenario,
    firstMessage,
    exampleDialogues,
    lorebook,
    systemPrompt,
    total,
    status,
    percentageOfBudget,
  };
}
