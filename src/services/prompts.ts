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
5. LANGUAGE & DIALECT FIDELITY: When a specific language or dialect (such as Hinglish in Roman script) is requested, strictly enforce it across all dialogue quotes and narrative actions without ever reverting to standard English.
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

/**
 * Detects if the user or profile requires Hinglish / Romanized Hindi and provides strict instructions
 */
export function buildLanguageDirectives(params: {
  text?: string;
  currentDialect?: string;
  povPerspective?: 'first_person' | 'third_person' | 'user_perspective';
  gender?: string;
}): string {
  const combinedText = params.text || '';
  const isHinglish =
    /\b(hinglish|hindi|urdu)\b/i.test(combinedText) || params.currentDialect === 'hinglish';

  const isFemale = /\b(female|woman|girl|she|her)\b/i.test(params.gender || '');

  // Detect perspective intent
  const wantsUserPerspective =
    params.povPerspective === 'user_perspective' ||
    /\b(user perspective|user pov|user's perspective|mere samne|meri aankhon|mere paas|from user|from my perspective|user 1st person|first person user|user first person|tum\/aap|tum\/you)\b/i.test(
      combinedText
    ) ||
    (/\buser\b/i.test(combinedText) && /\b(perspective|pov|first person|1st person)\b/i.test(combinedText)) ||
    (/\bfirst person\b/i.test(combinedText) && /\b(user|mere|mere samne)\b/i.test(combinedText));

  const wantsFirstPerson =
    !wantsUserPerspective &&
    (params.povPerspective === 'first_person' ||
      /\b(1st person|first person|first-person|1st-person|char perspective|char pov|main|mera|mujhe|as me|in 1st)\b/i.test(
        combinedText
      ));

  if (!isHinglish) {
    if (wantsUserPerspective) {
      return `
*** NARRATIVE PERSPECTIVE MANDATE: USER FIRST-PERSON POV ("ME / MY") ***
- The scene and roleplay narration inside asterisks (*...*) MUST be narrated from {{user}}'s first-person eyes ("me / my"):
  * Frame {{char}}'s actions towards me (e.g. *He steps slowly until he is standing right in front of me, his eyes locking onto mine.*).
- {{char}} is referred to as "He / She / They" or by name (never "I").
- Spoken dialogue inside double quotes MUST directly address {{user}} as "you".
`;
    }
    if (wantsFirstPerson) {
      return `
*** NARRATIVE PERSPECTIVE MANDATE: CHARACTER FIRST-PERSON (I / ME) ***
- {{char}} writes and narrates physical actions and internal thoughts in the FIRST PERSON ("I", "my", "me", e.g. *I step forward and glance at {{user}}.*).
`;
    }
    return '';
  }

  let povSection = '';
  if (wantsUserPerspective) {
    povSection = `
USER PERSPECTIVE (FIRST-PERSON FROM USER'S POINT OF VIEW - "MERE / MUJHE / MERI") MANDATE:
- The scene and roleplay narration inside asterisks (*...*) MUST be written from {{user}}'s first-person vantage point using "Mere / Mujhe / Meri" ("in front of me / towards me").
- Frame {{char}}'s actions and proximity relative to ME (the user):
  * Use phrases such as: "bilkul mere samne aakar khada ho jata hai", "mere kareeb aata hai", "meri aankhon mein dekhta hai", "meri taraf aage badhta hai", "mujhse kehta hai".
- The character {{char}} is referred to in narration as "Wo" or by name (e.g. "Wo dheere se chalte hue bilkul mere samne aakar ${isFemale ? 'khadi ho jati hai' : 'khada ho jata hai'}").
- CRITICAL: {{char}} MUST NEVER narrate physical actions as their own "Main / Mera / Mujhe" (e.g. DO NOT write "*Main aage badhta hoon...*"). The "mere / mujhe" always refers to the user!
- Spoken dialogue inside double quotes MUST directly address {{user}} in natural, modern conversational Hinglish ("Tum / Aap", e.g. "Tum yahan kya kar rahe ho?", "Tumhe lagta hai tum bach jaoge?").
- EXACT EXAMPLE FORMAT (User-Perspective 1st-Person):
  ${
    isFemale
      ? '*Halki baarish ki boondein gir rahi hain aur gali mein bilkul sannata hai. Achanak peeche se kadmon ki aahat aati hai. Wo dheere se chalte hue bilkul mere samne aakar khadi ho jati hai. Uski gehri aankhein seedha meri aankhon mein dekhti hain, aur uske chehre par ek halki si muskaan aati hai.* "Arre yaar, tumhe kya laga tha? Tum akele yahan aaoge aur mujhe pata nahi chalega? Bolo, ab kya plan hai tumhara?"'
      : '*Halki baarish ki boondein gir rahi hain aur gali mein bilkul sannata hai. Achanak peeche se kadmon ki aahat aati hai. Wo dheere se chalte hue bilkul mere samne aakar khada ho jata hai. Uski gehri aankhein seedha meri aankhon mein dekhti hain, aur uske chehre par ek halki si muskaan aati hai.* "Arre yaar, tumhe kya laga tha? Tum akele yahan aaoge aur mujhe pata nahi chalega? Bolo, ab kya plan hai tumhara?"'
  }
- ANTI-RAILROADING: Narrate what {{char}} does relative to me ("mere samne khada hota hai"). DO NOT force {{user}}'s internal feelings or spoken words.
`;
  } else if (wantsFirstPerson) {
    povSection = `
FIRST-PERSON PERSPECTIVE ("MAIN / MERA / MUJHE / MAINE") MANDATE:
- The character MUST write and narrate in the FIRST-PERSON ("Main", "Mera", "Mujhe", "Maine").
- NEVER use third-person words like "Wo dekhta hai", "Usne kaha", "{{char}} dekhti hai", or English "He/She looks".
- Physical actions and thoughts inside asterisks (*...*) MUST use 1st-person Hinglish:
  ${
    isFemale
      ? 'Example (Female 1st Person): *Main thoda aage badhti hoon aur ek gehri saans lekar seedha {{user}} ki taraf dekhti hoon.* "Arre yaar, mujhe laga tum nahi aaoge..."'
      : 'Example (Male 1st Person): *Main thoda aage badhta hoon aur ek gehri saans lekar seedha {{user}} ki taraf dekhta hoon.* "Arre yaar, mujhe laga tum nahi aaoge..."'
  }
- Correct verb endings:
  ${
    isFemale
      ? 'Use female 1st-person verbs: "karti hoon", "sochti hoon", "dekh rahi hoon", "maine socha", "mera mann tha".'
      : 'Use male 1st-person verbs: "karta hoon", "sochta hoon", "dekh raha hoon", "maine socha", "mera mann tha".'
  }
`;
  } else {
    povSection = `
THIRD-PERSON PERSPECTIVE ("{{char}} / WO / USNE") MANDATE:
- Descriptive actions inside asterisks (*...*) use third-person:
  Example: *{{char}} thoda piche mud kar ${isFemale ? 'dekhti hai' : 'dekhta hai'} aur muskurate hue aage ${isFemale ? 'badhti hai' : 'badhta hai'}.*
`;
  }

  return `
*** CRITICAL MANDATORY LANGUAGE PROTOCOL: HINGLISH IN ROMAN SCRIPT (NO ENGLISH REGRESSION) ***
The user requires HINGLISH (conversational Hindi written in the Roman/Latin English alphabet):
1. DIALOGUE IN QUOTES: All spoken dialogue inside double quotes ("...") MUST be in 100% natural, modern conversational Hinglish (e.g. "Arre yaar, tu abhi tak yahan hai? Maine tujhe bola tha na sab theek ho jayega.").
2. NARRATION & ACTIONS IN ASTERISKS: Descriptive actions (*...*) must ALSO be written in natural Hinglish storytelling flow rather than defaulting to formal Oxford English.
${povSection}
3. ABSOLUTELY ZERO ENGLISH REGRESSION: Do not start with one sentence in Hinglish and switch the remaining paragraphs or dialogue turns to pure English. The entire section must consistently maintain authentic Hinglish.
4. SCRIPT ENFORCEMENT: Strictly use the standard English/Latin alphabet for Hindi words (Romanized Hinglish). NEVER output Devanagari script (no हिन्दी letters) unless explicitly asked.
5. NATURAL SLANG: Use authentic modern conversational vocabulary ('yaar', 'arre', 'kya scene hai', 'samjhe na', 'bilkul', 'tension mat le').
`;
}

export function buildSectionRefinePrompt(params: {
  characterName: string;
  characterArchetype: string;
  sectionTitle: string;
  currentContent: string;
  userInstruction: string;
  languageDialect?: string;
  povPerspective?: 'first_person' | 'third_person' | 'user_perspective';
  gender?: string;
}): string {
  const langRule = buildLanguageDirectives({
    text: params.userInstruction,
    currentDialect: params.languageDialect,
    povPerspective: params.povPerspective,
    gender: params.gender,
  });
  return `You are refining a specific section of the SillyTavern character card for:
CHARACTER: ${params.characterName} (${params.characterArchetype})
SECTION: ${params.sectionTitle}

CURRENT CONTENT:
"""
${params.currentContent}
"""

USER'S DESIRED ADJUSTMENT / PREFERENCE:
"${params.userInstruction}"
${langRule}

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

  const isHinglish = profile.guardrails.languageDialect === 'hinglish';
  const pov = profile.guardrails.povPerspective;

  let povDesc = '';
  if (pov === 'user_perspective') {
    povDesc = isHinglish
      ? 'First-person from User perspective in Hinglish (narration from user\'s eyes using "mere / meri / mujhe", e.g. *Wo dheere se chalte hue bilkul mere samne aakar khada ho jata hai.* {{char}} is "Wo", dialogue addresses user as "Tum".)'
      : 'First-person from User perspective (narration from user\'s eyes using "me / my", e.g. *He steps until he is standing right in front of me.* {{char}} is third-person "he/she", dialogue addresses user as "you".)';
  } else if (pov === 'first_person') {
    povDesc = isHinglish
      ? 'Character first-person perspective in Hinglish ("Main", "Mera", "Mujhe", "Maine", e.g. *Main thoda aage badhta hoon aur muskurata hoon.*)'
      : 'Character first-person perspective as {{char}} ("I", "my")';
  } else {
    povDesc = isHinglish
      ? 'Third-person perspective in Hinglish ("{{char}}", "Wo", "Usne", e.g. *{{char}} thoda aage badhta hai.*)'
      : 'Third-person perspective ("{{char}}", "he/she/they")';
  }

  return `You are an elite narrative voice director.
Re-write the opening First Message and Example Dialogues for this character to strictly match the requested Narration Style and Story Direction.

CHARACTER: ${profile.identity.name} (${profile.identity.archetype})
PERSONALITY: ${profile.personality.coreTraits.join(', ')}. ${profile.personality.psychologicalProfile}
SPEECH MANNERISMS: ${profile.personality.speechMannerisms}
CURRENT SCENARIO: ${profile.scenario.environmentAndContext}
TARGET NARRATION STYLE: ${narrationDesc}
PERSPECTIVE: ${povDesc}
STORY DIRECTION & GOAL: ${profile.guardrails.storyGoalAndDirection || 'Maintain engaging roleplay tension and distinct character voice.'}
${buildLanguageDirectives({
  text: profile.guardrails.storyGoalAndDirection || '',
  currentDialect: profile.guardrails.languageDialect,
  povPerspective: profile.guardrails.povPerspective,
  gender: profile.identity.gender,
})}

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
${buildLanguageDirectives({
  text: params.instruction,
  currentDialect: params.profile.guardrails.languageDialect,
  povPerspective: params.profile.guardrails.povPerspective,
  gender: params.profile.identity.gender,
})}

CORE RULES:
1. Identify all sections affected by the user's request. Modify only the necessary sections; leave unaffected sections unchanged.
2. Maintain high quality, sensory depth, and voice consistency across all modified fields.
3. Anti-Railroading: In firstMessage and dialogues, NEVER speak, think, or act for {{user}}. The opening message must end with a compelling hook for {{user}} to respond.
4. If wardrobe or appearance changes, ensure any visual mentions in scenario and greetings stay coherent.
5. If narration style or tone changes, harmonize the prose in scenario.firstMessage and dialogues.
6. Perspective & Dialect: If the user requests User Perspective ("Tum / You / Aap"), update guardrails.povPerspective to "user_perspective" and frame narrative around {{user}} (never {{char}} as "Main"). If they request Character 1st-person, set povPerspective to "first_person". If 3rd-person, set to "third_person". If Hinglish is requested, update guardrails.languageDialect to "hinglish".

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
