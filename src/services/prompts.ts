/**
 * Professional Prompt Engineering Suite for SillyTavern Card Generation and Refinement
 */

import { GranularCharacterProfile } from '../types/sillytavern';
import {
  compileDescription,
  compilePersonality,
  compileExampleDialogues,
  compileSystemPrompt,
  compilePostHistoryInstructions,
} from '../utils/formatters';

export const SYSTEM_ROLE_ARCHITECT = `You are a master character designer, interactive narrative author, and elite SillyTavern character card engineer.
Your specialty is crafting deeply immersive, psychologically compelling roleplay characters adhering to modern LLM best practices:
1. SENSORY IMMERSION: Vivid visual details (lighting, materials, micro-expressions, posture).
2. POSITIVE USER AGENCY: Never write dialogue or actions on behalf of {{user}}. The opening scene must describe {{char}} and the immediate environment, ending on an engaging hook that invites {{user}} to respond.
3. VOICE DISTINCTIVENESS: Specific speech mannerisms, vocabulary, and multi-scenario example dialogues demonstrating emotional range.
4. CONTEXT ECONOMY: Lean, powerful descriptions avoiding generic filler prose.
Always respond with valid JSON when requested.`;

export function buildDeduceContextPrompt(baseIdea: string): string {
  return `You are a master narrative architect. Analyze this character concept:
"${baseIdea}"

Autonomously deduce the optimal:
1. Setting / Genre (e.g. "Steampunk Fantasy", "Cyberpunk Dystopia", "Gothic Victorian", "Sci-Fi Space Opera")
2. Tone / Atmosphere (e.g. "Gritty & Wry", "Melancholy & Haunting", "High-Stakes & Tense", "Whimsical & Adventurous")
3. Dynamic with {{user}} (e.g. "Reluctant Allies", "Rivals with unspoken respect", "Informant and Handler", "Master and Apprentice")

Respond ONLY with a valid JSON object:
{
  "genre": "...",
  "tone": "...",
  "userDynamic": "..."
}`;
}

export function buildFullCardPrompt(params: {
  baseIdea: string;
  genre?: string;
  tone?: string;
  userDynamic?: string;
}): string {
  const hasGenre = params.genre && params.genre.trim() && params.genre !== 'Auto-detected by AI';
  const hasTone = params.tone && params.tone.trim() && params.tone !== 'Auto-detected by AI';
  const hasDynamic = params.userDynamic && params.userDynamic.trim() && params.userDynamic !== 'Auto-detected by AI';

  return `Please design an elite, cohesive SillyTavern V2 character card based on this core concept:
BASE IDEA: "${params.baseIdea}"
${hasGenre ? `GENRE / SETTING: ${params.genre}` : 'GENRE / SETTING: Autonomously deduce the most atmospheric, compelling setting and genre from the base idea.'}
${hasTone ? `TONE / MOOD: ${params.tone}` : 'TONE / MOOD: Autonomously deduce the most emotionally engaging tone and narrative mood from the base idea.'}
${hasDynamic ? `RELATIONSHIP WITH {{user}}: ${params.userDynamic}` : 'RELATIONSHIP WITH {{user}}: Autonomously craft a rich, dynamic, tension-filled or intriguing relationship with {{user}} that naturally invites roleplay.'}

Generate a complete, deeply detailed JSON object with the exact schema below. Do not wrap in markdown quotes if possible, or output only valid JSON.

JSON SCHEMA:
{
  "inferredContext": {
    "genre": "Deduced genre / setting",
    "tone": "Deduced mood / atmosphere",
    "userDynamic": "Deduced dynamic with {{user}}"
  },
  "identity": {
    "name": "Full name",
    "nickname": "Title, alias or nickname",
    "age": "Apparent or biological age",
    "gender": "Gender",
    "species": "Species or race",
    "archetype": "Concise role archetype",
    "tags": ["3-6 relevant tags including genre and archetype"]
  },
  "appearance": {
    "heightAndBuild": "Detailed height, frame, body type, and posture",
    "faceAndEyes": "Eye color/shape, facial structure, expression, features",
    "hair": "Hair color, length, texture, and styling",
    "complexion": "Skin tone and texture",
    "distinctiveMarks": "Scars, tattoos, piercings, birthmarks, or unnatural marks",
    "generalImpressions": "Physical aura and presence when walking into a room"
  },
  "wardrobe": {
    "signatureOutfit": "Head-to-toe default outfit describing fabrics, cuts, colors, and layers",
    "footwear": "Type, material, and condition of boots or shoes",
    "accessoriesAndJewelry": "Rings, necklaces, belts, eyewear, or talismans",
    "equipmentAndWeapons": "Carried gear, tools, sidearms, or magical foci",
    "alternateOutfits": "Formal, travel, or combat alternate attire"
  },
  "personality": {
    "coreTraits": ["4-5 defining trait keywords"],
    "psychologicalProfile": "Detailed 2-3 paragraph breakdown of mindset, fears, vulnerabilities, moral compass, and motivations",
    "likes": ["3-5 specific likes"],
    "dislikes": ["3-5 specific dislikes"],
    "quirksAndHabits": ["2-3 unconscious behavioral habits or quirks"],
    "speechMannerisms": "Voice pitch, cadence, accent, slang, and verbal habits"
  },
  "background": {
    "backstory": "Rich 2-3 paragraph history explaining how they became who they are",
    "currentOccupation": "Present employment, quest, or survival status",
    "motivations": "Immediate and long-term driving goals",
    "secrets": "One closely guarded secret",
    "dynamicWithUser": "How they perceive and treat {{user}} initially"
  },
  "scenario": {
    "environmentAndContext": "Current sensory environment, weather, and immediate context",
    "firstMessage": "Rich, multi-paragraph opening scene setting up atmosphere, describing {{char}}'s actions, and ending with an open-ended dialogue or action directed at {{user}} WITHOUT speaking or acting for {{user}}.",
    "alternateGreetings": [
      "An alternate introductory greeting in a different mood or setting"
    ]
  },
  "dialogues": {
    "casual": "<START>\\n{{user}}: \\"Casual prompt\\"\\n{{char}}: *Actions with asterisks.* \\"Dialogue in quotes showcasing baseline voice and slang.\\"",
    "conflict": "<START>\\n{{user}}: \\"Challenging prompt\\"\\n{{char}}: *Actions under tension.* \\"How they react when threatened, angry, or cornered.\\"",
    "vulnerable": "<START>\\n{{user}}: \\"Personal prompt\\"\\n{{char}}: *Subtle micro-expressions.* \\"A rare moment of honesty or emotional depth.\\""
  },
  "lorebook": [
    {
      "comment": "Main City, Faction, or Magic System Name",
      "keys": ["Primary Keyword", "Secondary"],
      "secondary_keys": ["contextual", "trigger"],
      "content": "Rich, concise 2-3 sentence lore entry explaining history, rules, or mechanics."
    },
    {
      "comment": "Key Organization or Relic Name",
      "keys": ["Keyword"],
      "secondary_keys": ["contextual"],
      "content": "Concise factual lore entry."
    },
    {
      "comment": "Cultural Element or Conflict",
      "keys": ["Keyword"],
      "secondary_keys": ["contextual"],
      "content": "Concise factual lore entry."
    }
  ]
}`;
}

export function buildSectionRefinePrompt(params: {
  characterName: string;
  characterArchetype: string;
  sectionTitle: string;
  currentContent: string;
  userInstruction: string;
}): string {
  return `You are refining a specific section of the SillyTavern character card for:
CHARACTER: ${params.characterName} (${params.characterArchetype})
SECTION: ${params.sectionTitle}

CURRENT CONTENT:
"""
${params.currentContent}
"""

USER'S DESIRED ADJUSTMENT / PREFERENCE:
"${params.userInstruction}"

INSTRUCTIONS:
- Refine the text to directly fulfill the user's preference while maintaining complete stylistic consistency with the character.
- Keep the formatting clean and descriptive.
- Output ONLY the updated content for this section, with no conversational filler or preambles.`;
}

export function buildArtPromptGeneration(profile: GranularCharacterProfile): string {
  const { identity, appearance, wardrobe } = profile;
  return `Convert this character's appearance and clothing into an image generation prompt:
CHARACTER: ${identity.name}, ${identity.age} year old ${identity.gender} ${identity.species}, ${identity.archetype}
APPEARANCE: ${appearance.heightAndBuild}, ${appearance.faceAndEyes}, ${appearance.hair}, ${appearance.complexion}, ${appearance.distinctiveMarks}
WARDROBE: ${wardrobe.signatureOutfit}, ${wardrobe.accessoriesAndJewelry}, ${wardrobe.equipmentAndWeapons}

Generate a JSON object with:
{
  "positivePrompt": "comma-separated Danbooru/Stable Diffusion tags followed by rich descriptive phrases, masterpiece, highly detailed, dramatic lighting, 8k portrait",
  "negativePrompt": "worst quality, low quality, bad anatomy, bad hands, extra digits, deformed, watermark, signature",
  "midjourneyPrompt": "/imagine prompt: [cinematic shot description with lighting, camera angle, and artistic style] --ar 1:1 --v 6.0"
}`;
}

export function buildHarmonizeDialoguesPrompt(profile: GranularCharacterProfile): string {
  const narrationDesc = {
    literary: 'Atmospheric literary prose with rich sensory details (lighting, sounds, micro-expressions, scents) and measured pacing.',
    cinematic: 'Cinematic visual blocking with sharp camera-like framing, dynamic movement, and spatial choreography.',
    visceral: 'Raw, visceral physiological sensations (heart rate, adrenaline, physical touch, breathing tension).',
    conversational: 'Fast-paced, dialogue-focused exchange with witty banter and concise physical gestures.',
  }[profile.guardrails.narrationStyle] || 'Atmospheric literary prose';

  const povDesc = profile.guardrails.povPerspective === 'first_person'
    ? 'First-person perspective as {{char}} ("I", "my")'
    : 'Third-person perspective ("{{char}}", "he/she/they")';

  return `You are an elite narrative voice director.
Re-write the opening First Message and Example Dialogues for this character to strictly match the requested Narration Style and Story Direction.

CHARACTER: ${profile.identity.name} (${profile.identity.archetype})
PERSONALITY: ${profile.personality.coreTraits.join(', ')}. ${profile.personality.psychologicalProfile}
SPEECH MANNERISMS: ${profile.personality.speechMannerisms}
CURRENT SCENARIO: ${profile.scenario.environmentAndContext}
TARGET NARRATION STYLE: ${narrationDesc}
PERSPECTIVE: ${povDesc}
STORY DIRECTION & GOAL: ${profile.guardrails.storyGoalAndDirection || 'Maintain engaging roleplay tension and distinct character voice.'}

RULES:
1. Physical actions and micro-expressions in asterisks (*like this*), spoken dialogue in quotes ("like this").
2. NEVER write dialogue, thoughts, or actions for {{user}}. The first message must describe {{char}} and the sensory scene, ending with an open hook for {{user}}.
3. Example dialogues must be structured with <START> blocks and demonstrate the character's unique voice and the selected narration style.

Output ONLY a valid JSON object:
{
  "firstMessage": "Multi-paragraph opening scene written in the exact narration style...",
  "casual": "<START>\\n{{user}}: \\"Casual question\\"\\n{{char}}: *Actions matching narration style.* \\"Dialogue in character voice.\\"",
  "conflict": "<START>\\n{{user}}: \\"Challenging confrontation\\"\\n{{char}}: *Actions under pressure.* \\"Reaction in character voice.\\"",
  "vulnerable": "<START>\\n{{user}}: \\"Personal moment\\"\\n{{char}}: *Subtle micro-expression.* \\"Emotional dialogue.\\""
}`;
}

export interface GlobalRefineResult {
  changeSummary: string[];
  modifiedSections: string[];
  updates: Partial<GranularCharacterProfile>;
}

export function buildGlobalRefinePrompt(params: {
  profile: GranularCharacterProfile;
  instruction: string;
  selectedSections?: string[];
}): string {
  const currentSummary = {
    identity: {
      name: params.profile.identity.name,
      nickname: params.profile.identity.nickname,
      age: params.profile.identity.age,
      gender: params.profile.identity.gender,
      species: params.profile.identity.species,
      archetype: params.profile.identity.archetype,
      tags: params.profile.identity.tags,
    },
    appearance: params.profile.appearance,
    wardrobe: params.profile.wardrobe,
    personality: params.profile.personality,
    background: params.profile.background,
    scenario: params.profile.scenario,
    dialogues: params.profile.dialogues,
    guardrails: {
      narrationStyle: params.profile.guardrails.narrationStyle,
      povPerspective: params.profile.guardrails.povPerspective,
      pacingRule: params.profile.guardrails.pacingRule,
      storyGoalAndDirection: params.profile.guardrails.storyGoalAndDirection,
    },
    lorebook: params.profile.lorebook.map(e => ({
      comment: e.comment,
      keys: e.keys,
      content: e.content,
    })),
  };

  const scopeNote = params.selectedSections && params.selectedSections.length > 0
    ? `\nFOCUS PRIMARILY ON THESE USER-REQUESTED SECTIONS: ${params.selectedSections.join(', ')}.`
    : '\nAUTONOMOUSLY DETECT which sections of the card must be updated, refined, or rewritten to satisfy the user\'s instruction.';

  return `You are an elite SillyTavern character card architect and master narrative editor.
The user wants to make global or cross-section improvements/modifications to their existing character card.

CURRENT CHARACTER DATA:
${JSON.stringify(currentSummary, null, 2)}

USER'S INSTRUCTION / DESIRED IMPROVEMENTS:
"${params.instruction}"
${scopeNote}

CORE RULES:
1. Identify all sections affected by the user's request. Modify only the necessary sections; leave unaffected sections unchanged.
2. Maintain high quality, sensory depth, and voice consistency across all modified fields.
3. Anti-Railroading: In firstMessage and dialogues, NEVER speak, think, or act for {{user}}. The opening message must end with a compelling hook for {{user}} to respond.
4. If wardrobe or appearance changes, ensure any visual mentions in scenario and greetings stay coherent.
5. If narration style or tone changes, harmonize the prose in scenario.firstMessage and dialogues.

Return ONLY a valid JSON object matching this schema:
{
  "changeSummary": [
    "Brief explanation of change made to Section 1",
    "Brief explanation of change made to Section 2"
  ],
  "modifiedSections": ["wardrobe", "scenario", "dialogues"],
  "updates": {
    // Top-level keys for ONLY the sections that were modified:
    // "identity": { ... },
    // "appearance": { ... },
    // "wardrobe": { ... },
    // "personality": { ... },
    // "background": { ... },
    // "scenario": { ... },
    // "dialogues": { ... },
    // "guardrails": { ... },
    // "lorebook": [ { "comment": "...", "keys": ["..."], "content": "..." } ]
  }
}`;
}

export function buildSandboxChatMessages(
  profile: GranularCharacterProfile,
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const systemPrompt = compileSystemPrompt(profile);
  const description = compileDescription(profile, 'natural');
  const personality = compilePersonality(profile, 'natural');
  const exampleDialogues = compileExampleDialogues(profile);

  const fullSystemMessage = [
    systemPrompt ? `[System Directives]\n${systemPrompt}` : '',
    `[Character: ${profile.identity.name}]`,
    `[Description]\n${description}`,
    `[Personality]\n${personality}`,
    profile.scenario.environmentAndContext ? `[Scenario]\n${profile.scenario.environmentAndContext}` : '',
    exampleDialogues ? `[Example Dialogues]\n${exampleDialogues}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: fullSystemMessage },
    ...chatHistory,
  ];

  const postHistory = compilePostHistoryInstructions(profile);
  if (postHistory) {
    messages.push({ role: 'system', content: postHistory });
  }

  return messages;
}
