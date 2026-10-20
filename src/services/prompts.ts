/**
 * Professional Prompt Engineering Suite for SillyTavern Card Generation and Refinement
 */

import { GranularCharacterProfile } from '../types/sillytavern';
import { compileDescription, compilePersonality, compileExampleDialogues, compileSystemPrompt } from '../utils/formatters';

export const SYSTEM_ROLE_ARCHITECT = `You are a master character designer, interactive narrative author, and elite SillyTavern character card engineer.
Your specialty is crafting deeply immersive, psychologically compelling roleplay characters adhering to modern LLM best practices:
1. SENSORY IMMERSION: Vivid visual details (lighting, materials, micro-expressions, posture).
2. POSITIVE USER AGENCY: Never write dialogue or actions on behalf of {{user}}. The opening scene must describe {{char}} and the immediate environment, ending on an engaging hook that invites {{user}} to respond.
3. VOICE DISTINCTIVENESS: Specific speech mannerisms, vocabulary, and multi-scenario example dialogues demonstrating emotional range.
4. CONTEXT ECONOMY: Lean, powerful descriptions avoiding generic filler prose.
Always respond with valid JSON when requested.`;

export function buildFullCardPrompt(params: {
  baseIdea: string;
  genre?: string;
  tone?: string;
  userDynamic?: string;
}): string {
  return `Please design an elite, cohesive SillyTavern V2 character card based on this core concept:
BASE IDEA: "${params.baseIdea}"
${params.genre ? `GENRE / SETTING: ${params.genre}` : ''}
${params.tone ? `TONE / MOOD: ${params.tone}` : ''}
${params.userDynamic ? `RELATIONSHIP WITH {{user}}: ${params.userDynamic}` : ''}

Generate a complete, deeply detailed JSON object with the exact schema below. Do not wrap in markdown quotes if possible, or output only valid JSON.

JSON SCHEMA:
{
  "identity": {
    "name": "Full name",
    "nickname": "Title, alias or nickname",
    "age": "Apparent or biological age",
    "gender": "Gender",
    "species": "Species or race",
    "archetype": "Concise role archetype",
    "tags": ["3-6 relevant tags"]
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

  return [
    { role: 'system', content: fullSystemMessage },
    ...chatHistory,
  ];
}
