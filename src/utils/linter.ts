/**
 * 6-Point Professional Quality Auditor and Macro Linter for SillyTavern Cards
 */

import { GranularCharacterProfile } from '../types/sillytavern';
import { analyzeTokenBudget } from './tokenCounter';
import { compileDescription, compilePersonality, profileToV2Card } from './formatters';

export interface AuditIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'macros' | 'agency' | 'dialogue' | 'tokens' | 'sensory' | 'lorebook';
  title: string;
  description: string;
  fixable: boolean;
  field?: string;
}

export interface AuditReport {
  score: number; // 0 - 100
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  issues: AuditIssue[];
  strengths: string[];
}

export function auditCharacterProfile(profile: GranularCharacterProfile): AuditReport {
  const issues: AuditIssue[] = [];
  const strengths: string[] = [];
  let scoreDeductions = 0;

  const cardV2 = profileToV2Card(profile, 'natural');
  const tokenBreakdown = analyzeTokenBudget(cardV2.data);

  // 1. Check Macro Syntax in all text fields
  const allTexts = [
    profile.scenario.firstMessage,
    ...profile.scenario.alternateGreetings,
    profile.dialogues.casual,
    profile.dialogues.conflict,
    profile.dialogues.vulnerable,
    profile.dialogues.customExamples,
    profile.background.backstory,
    profile.background.dynamicWithUser,
  ].join(' ');

  const brokenCharMatches = allTexts.match(/(?<!\{)\{char\}(?!\})|<char>|\$char/gi);
  const brokenUserMatches = allTexts.match(/(?<!\{)\{user\}(?!\})|<user>|\$user/gi);

  if (brokenCharMatches || brokenUserMatches) {
    scoreDeductions += 15;
    issues.push({
      id: 'broken-macros',
      type: 'error',
      category: 'macros',
      title: 'Malformed Macro Syntax Detected',
      description: 'Found single brackets or invalid tags like {user} or {char}. SillyTavern requires double curly braces {{char}} and {{user}}.',
      fixable: true,
    });
  } else {
    strengths.push('Clean macro syntax: {{char}} and {{user}} are properly delimited.');
  }

  // 2. Check User Agency / Anti-Railroading in First Message
  const firstMes = profile.scenario.firstMessage;
  const userImpersonationPatterns = [
    /you feel\b/i,
    /you say\b/i,
    /you think\b/i,
    /you nod\b/i,
    /you walk\b/i,
    /you look\b/i,
    /\{\{user\}\} (?:feels?|says?|thinks?|nods?|walks?|replies?|gasps?)\b/i,
  ];

  const foundImpersonation = userImpersonationPatterns.some(p => p.test(firstMes));
  if (foundImpersonation) {
    scoreDeductions += 20;
    issues.push({
      id: 'user-railroading',
      type: 'error',
      category: 'agency',
      title: 'User Agency Violation (Impersonation)',
      description: 'The first message dictates {{user}}\'s emotions, actions, or words. Top-tier cards describe {{char}}\'s actions and pass the turn to {{user}} without forcing actions onto them.',
      fixable: true,
      field: 'firstMessage',
    });
  } else {
    strengths.push('User agency preserved: The opening scene does not speak or act for {{user}}.');
  }

  // 3. Example Dialogues Quality & <START> delimiter
  const totalExamples = [
    profile.dialogues.casual,
    profile.dialogues.conflict,
    profile.dialogues.vulnerable,
    profile.dialogues.customExamples,
  ].filter(Boolean).length;

  if (totalExamples === 0) {
    scoreDeductions += 25;
    issues.push({
      id: 'missing-dialogues',
      type: 'error',
      category: 'dialogue',
      title: 'Missing Example Dialogues',
      description: 'Example dialogues (<START>) are the #1 factor controlling character tone, accent, and roleplay cadence. Add at least 2-3 dialogue samples.',
      fixable: true,
      field: 'dialogues',
    });
  } else {
    const rawDialogue = [
      profile.dialogues.casual,
      profile.dialogues.conflict,
      profile.dialogues.vulnerable,
      profile.dialogues.customExamples,
    ].join('\n');

    if (!rawDialogue.includes('<START>')) {
      scoreDeductions += 10;
      issues.push({
        id: 'missing-start-tag',
        type: 'warning',
        category: 'dialogue',
        title: 'Missing <START> Tags in Dialogues',
        description: 'SillyTavern expects dialogue chunks to begin with <START> to prevent context bleed between roleplay scenes.',
        fixable: true,
        field: 'dialogues',
      });
    } else {
      strengths.push('Example dialogues use proper <START> chunk formatting.');
    }

    if (totalExamples >= 3) {
      strengths.push('Rich multi-scenario voice coverage (Casual, Conflict, Vulnerable).');
    }
  }

  // 4. Token Budget Analysis
  if (tokenBreakdown.status === 'warning') {
    scoreDeductions += 15;
    issues.push({
      id: 'token-bloat',
      type: 'warning',
      category: 'tokens',
      title: `High Permanent Token Count (~${tokenBreakdown.total} tokens)`,
      description: 'Cards above 2,000 permanent tokens significantly reduce chat memory and cause LLMs to forget previous conversations. Consider condensing.',
      fixable: true,
    });
  } else if (tokenBreakdown.status === 'under') {
    scoreDeductions += 10;
    issues.push({
      id: 'token-under',
      type: 'info',
      category: 'tokens',
      title: `Sparse Card Definition (~${tokenBreakdown.total} tokens)`,
      description: 'Card is under 600 tokens. Adding more sensory appearance, clothing, and voice examples will elevate roleplay immersion.',
      fixable: true,
    });
  } else {
    strengths.push(`Optimized token footprint (~${tokenBreakdown.total} tokens within the 800-1600 sweet-spot).`);
  }

  // 5. Sensory & Physical Richness
  const appearanceFilled =
    profile.appearance.faceAndEyes.length > 10 &&
    profile.appearance.hair.length > 10 &&
    profile.appearance.heightAndBuild.length > 10;

  const wardrobeFilled =
    profile.wardrobe.signatureOutfit.length > 15 &&
    profile.wardrobe.accessoriesAndJewelry.length > 5;

  if (!appearanceFilled) {
    scoreDeductions += 10;
    issues.push({
      id: 'sparse-appearance',
      type: 'warning',
      category: 'sensory',
      title: 'Incomplete Physical Description',
      description: 'Face, eyes, hair, or physical build are brief or missing. Provide vivid visual anchors for descriptive immersion.',
      fixable: true,
      field: 'appearance',
    });
  } else {
    strengths.push('Detailed physical appearance (build, facial features, hair, distinctive marks).');
  }

  if (!wardrobeFilled) {
    scoreDeductions += 10;
    issues.push({
      id: 'sparse-wardrobe',
      type: 'warning',
      category: 'sensory',
      title: 'Incomplete Wardrobe & Gear',
      description: 'Specific clothing layers, footwear, and carried equipment help LLMs keep character appearance consistent in roleplay.',
      fixable: true,
      field: 'wardrobe',
    });
  } else {
    strengths.push('Vivid wardrobe and gear specification.');
  }

  // 6. Lorebook Quality
  if (profile.lorebook.length > 0) {
    for (const entry of profile.lorebook) {
      const badKeys = entry.keys.filter(k => k.trim().length <= 2 || ['the', 'and', 'for', 'you'].includes(k.toLowerCase().trim()));
      if (badKeys.length > 0) {
        scoreDeductions += 5;
        issues.push({
          id: `bad-lorebook-key-${entry.id}`,
          type: 'warning',
          category: 'lorebook',
          title: `Broad Lorebook Keyword in "${entry.comment || 'Entry'}"`,
          description: `Key(s) "${badKeys.join(', ')}" are too generic and will trigger constantly, causing unnecessary token waste.`,
          fixable: false,
        });
        break;
      }
    }
  }

  // Compute final score
  const score = Math.max(0, Math.min(100, 100 - scoreDeductions));

  let grade: 'S' | 'A' | 'B' | 'C' | 'D';
  if (score >= 95) grade = 'S';
  else if (score >= 85) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 50) grade = 'C';
  else grade = 'D';

  return {
    score,
    grade,
    issues,
    strengths,
  };
}

/**
 * 1-Click Auto-Fix for Broken Macros in a Profile
 */
export function autoFixMacros(profile: GranularCharacterProfile): GranularCharacterProfile {
  const replaceMacros = (str: string) => {
    return str
      .replace(/(?<!\{)\{char\}(?!\})|<char>|\$char/gi, '{{char}}')
      .replace(/(?<!\{)\{user\}(?!\})|<user>|\$user/gi, '{{user}}');
  };

  return {
    ...profile,
    scenario: {
      ...profile.scenario,
      firstMessage: replaceMacros(profile.scenario.firstMessage),
      alternateGreetings: profile.scenario.alternateGreetings.map(replaceMacros),
    },
    dialogues: {
      casual: replaceMacros(profile.dialogues.casual),
      conflict: replaceMacros(profile.dialogues.conflict),
      vulnerable: replaceMacros(profile.dialogues.vulnerable),
      customExamples: replaceMacros(profile.dialogues.customExamples),
    },
    background: {
      ...profile.background,
      backstory: replaceMacros(profile.background.backstory),
      dynamicWithUser: replaceMacros(profile.background.dynamicWithUser),
    },
  };
}
