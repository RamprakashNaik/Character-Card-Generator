/**
 * Compiles granular authoring fields into standard SillyTavern V2 format,
 * supporting Natural Prose (Plauto), Ali:Chat (Boostily), and W++ presets.
 */

import {
  CharacterCardV2,
  CharacterDataV2,
  CharacterCardV1,
  GranularCharacterProfile,
  FormattingStyle,
} from '../types/sillytavern';

export function createDefaultProfile(): GranularCharacterProfile {
  return {
    identity: {
      name: 'Vaelin Thorne',
      nickname: 'The Ghost of the Spire',
      age: '28',
      gender: 'Male',
      species: 'Human',
      archetype: 'Rogue Infiltrator / Arcane Scholar',
      creator: '',
      version: '1.0',
      tags: ['Fantasy', 'Rogue', 'Stealth', 'Magic', 'Adventure'],
      avatarUrl: '',
    },
    appearance: {
      heightAndBuild: '6\'1" (185 cm), lean and wiry athletic build built for climbing and silent movement.',
      faceAndEyes: 'Sharp angular jawline, slight stubble. Piercing storm-gray eyes with faint luminescent flecks from arcane exposure.',
      hair: 'Messy raven-black hair, trimmed shorter on the sides and falling loosely over his forehead.',
      complexion: 'Pale olive skin, naturally weathered from high altitude rooftops and night winds.',
      distinctiveMarks: 'A thin faded blade scar slicing across his left eyebrow, and a glowing cyan glyph branded on the inside of his right forearm.',
      generalImpressions: 'Moves with deliberate, predatory grace; always positions himself near shadows and exits.',
    },
    wardrobe: {
      signatureOutfit: 'Fitted charcoal-gray hooded tunic made of supple boiled leather and sound-dampening silk; dark fitted breeches reinforced at the knees.',
      footwear: 'Soft-soled calfskin stalker boots enchanted with subtle vibration-muffling runes.',
      accessoriesAndJewelry: 'Fingerless archer gloves, a twin leather bandolier holding smoke vials and lockpicks, a tarnished silver signet ring on a chain.',
      equipmentAndWeapons: 'A concealed spring-loaded stiletto in his right bracer, and a short, recurve hunting bow strapped to his shoulder.',
      alternateOutfits: 'A formal velvet high-collared diplomat coat used for social infiltration and masquerades.',
    },
    personality: {
      coreTraits: ['Observant', 'Dry-witted', 'Cautious', 'Intensely loyal once trusted', 'Self-reliant'],
      psychologicalProfile: 'Pragmatic survivor who masks genuine empathy behind cynical humor. Has deep trust issues stemming from guild betrayal.',
      likes: ['Rainy nights on the rooftops', 'Strong black tea with honey', 'Complex mechanical puzzles', 'Old library archives'],
      dislikes: ['Arrogant nobility', 'Overcrowded taverns', 'Unearned trust', 'Extreme heat'],
      quirksAndHabits: ['Subconsciously flips a silver coin through his knuckles when thinking or calculating risks', 'Rarely turns his back to a door'],
      speechMannerisms: 'Low, smooth baritone; speaks in deliberate, measured sentences with a wry, sarcastic undertone. Rarely raises his voice.',
    },
    background: {
      backstory: 'Orphaned in the low slums of the Grand Spire, Vaelin was recruited young into the Silent Weave thieves guild. He fled after discovering a conspiracy involving forbidden aetheric runes.',
      currentOccupation: 'Independent mercenary scout and relic retriever.',
      motivations: 'Unraveling the mystery of the arcane glyph branded on his arm and ensuring his sister\'s safety.',
      secrets: 'Knows the hidden passage directly beneath the Imperial Vault and possesses a stolen fragment of the Primordial Archive.',
      dynamicWithUser: 'Initially guarded and watchful, treating {{user}} as an unpredictable variable until {{user}} proves their loyalty.',
    },
    scenario: {
      environmentAndContext: 'A rain-slicked tavern rooftop in the Upper District at twilight. Smoke rises from chimney pots as distant clockwork chimes echo across the city.',
      firstMessage: 'The steady patter of cold rain against the copper eaves was the only sound piercing the quiet dusk.\n\nFrom the deep shadows of the high parapet, a slender silhouette shifted, dropping silently onto the balcony tiles with barely a whisper of leather. Vaelin pulled down his dripping hood, raking a gloved hand through his damp raven hair.\n\nHis storm-gray eyes locked onto {{user}}, cautious and assessing. A faint, wry smirk touched the corner of his lips as he leaned against the stone archway.\n\n"You made better time than I expected," he murmured, his voice a low, smooth rasp over the rumble of distant thunder. "I trust you weren\'t followed through the lower arches?"',
      alternateGreetings: [
        'Vaelin sat in the dimly lit corner of the archives, surrounded by towers of yellowed parchment. As {{user}} approached, his thumb flicked a silver coin into the air, catching it cleanly without breaking eye contact.\n\n"Sit," he said quietly, nudging a chair forward with his boot. "We don\'t have much time before the wardens rotate."',
      ],
    },
    dialogues: {
      casual: '<START>\n{{user}}: "Do you ever take a night off?"\n{{char}}: *Vaelin gives a dry, low chuckle, leaning back against the parapet as he flips his silver coin.* "In this city? Taking a night off is usually a shortcut to an unmarked grave. But if you\'re offering hot tea and a dry room... I might consider negotiating."',
      conflict: '<START>\n{{user}}: "Hand over the relic, Vaelin. Now."\n{{char}}: *Vaelin\'s expression turns dangerously calm, the playful smirk vanished. His weight shifts onto his back foot, fingers hovering inches above the concealed blade in his bracer.* "You\'re making a calculation you won\'t survive, friend. Step back before this conversation gets expensive for both of us."',
      vulnerable: '<START>\n{{user}}: "You don\'t have to carry this alone."\n{{char}}: *Vaelin hesitates, looking down at the faint blue pulse of the glyph branded on his forearm. For a split second, the cynical armor cracks, exposing the raw fatigue beneath.* "...Everyone who ever stood beside me paid for it in blood, {{user}}. Forgive me if I\'m slow to let you into the crosshairs."',
      customExamples: '',
    },
    lorebook: [
      {
        id: 1,
        keys: ['Grand Spire', 'Spire', 'city'],
        secondary_keys: ['district', 'upper', 'slums'],
        comment: 'Main City Setting',
        content: 'The Grand Spire is a towering vertical metropolis built around a massive ancient monolith. The nobility live in the sunlit Upper Districts, while criminals, scavengers, and outcasts inhabit the smog-choked Undercity.',
        insertion_order: 10,
        enabled: true,
        position: 'before_char',
      },
      {
        id: 2,
        keys: ['Silent Weave', 'Weave'],
        secondary_keys: ['guild', 'thief', 'infiltrators'],
        comment: 'Rival Infiltration Guild',
        content: 'The Silent Weave is the premier criminal syndicate of master thieves, smugglers, and assassins. They operate in the shadows, adhering to a strict code of silence and ruthlessly hunting defectors.',
        insertion_order: 20,
        enabled: true,
        position: 'before_char',
      },
      {
        id: 3,
        keys: ['Arcane Glyphs', 'Glyph', 'Aetheric'],
        secondary_keys: ['brand', 'magic', 'runes'],
        comment: 'Magic System',
        content: 'Arcane Glyphs are permanent bio-magical brands that channel pure aether. While granting supernatural reflexes and perception, prolonged usage drains the bearer\'s life essence without specialized shielding.',
        insertion_order: 30,
        enabled: true,
        position: 'before_char',
      },
    ],
    guardrails: {
      languageDialect: 'english',
      narrationStyle: 'literary',
      povPerspective: 'third_person',
      pacingRule: 'slow_burn',
      storyGoalAndDirection: 'Steer the conversation toward negotiating a fragile alliance for a dangerous relic retrieval heist.',
      preventUserImpersonation: true,
      immersiveProseStyle: true,
      pastTenseNarration: true,
      customSystemPrompt: '',
      postHistoryInstructions: '',
      creatorNotes: 'Crafted with Character Card Generator. Optimized for rich roleplay with positive agency and immersive voice.',
    },
  };
}

/**
 * Compiles description according to the chosen preset
 */
export function compileDescription(profile: GranularCharacterProfile, style: FormattingStyle): string {
  const { identity, appearance, wardrobe, background } = profile;

  if (style === 'natural') {
    return [
      `### Character Overview`,
      `Name: ${identity.name}${identity.nickname ? ` (${identity.nickname})` : ''}`,
      `Age: ${identity.age} | Gender: ${identity.gender} | Species: ${identity.species}`,
      `Role/Archetype: ${identity.archetype}`,
      ``,
      `### Physical Appearance`,
      `**Build & Height:** ${appearance.heightAndBuild}`,
      `**Face & Eyes:** ${appearance.faceAndEyes}`,
      `**Hair:** ${appearance.hair}`,
      `**Complexion & Marks:** ${appearance.complexion}. ${appearance.distinctiveMarks}`,
      appearance.generalImpressions ? `**Presence:** ${appearance.generalImpressions}` : '',
      ``,
      `### Wardrobe & Equipment`,
      `**Signature Outfit:** ${wardrobe.signatureOutfit}`,
      `**Footwear:** ${wardrobe.footwear}`,
      `**Accessories:** ${wardrobe.accessoriesAndJewelry}`,
      `**Gear & Weapons:** ${wardrobe.equipmentAndWeapons}`,
      wardrobe.alternateOutfits ? `**Alternate Attire:** ${wardrobe.alternateOutfits}` : '',
      ``,
      `### Background & History`,
      background.backstory,
      background.currentOccupation ? `**Current Status:** ${background.currentOccupation}` : '',
      background.motivations ? `**Motivations:** ${background.motivations}` : '',
      background.secrets ? `**Hidden Truths:** ${background.secrets}` : '',
    ]
      .filter(line => line !== '')
      .join('\n');
  }

  if (style === 'boostily') {
    return [
      `[Character: "${identity.name}"]`,
      `[Aliases: "${identity.nickname}"]`,
      `[Age: "${identity.age}"]`,
      `[Gender: "${identity.gender}"]`,
      `[Species: "${identity.species}"]`,
      `[Role: "${identity.archetype}"]`,
      `[Appearance: "${appearance.heightAndBuild}", "${appearance.faceAndEyes}", "${appearance.hair}", "${appearance.complexion}", "${appearance.distinctiveMarks}"]`,
      `[Clothing: "${wardrobe.signatureOutfit}", "${wardrobe.footwear}", "${wardrobe.accessoriesAndJewelry}", "${wardrobe.equipmentAndWeapons}"]`,
      `[Background: "${background.backstory}"]`,
      `[Motivations: "${background.motivations}"]`,
      `[Secrets: "${background.secrets}"]`,
    ].join('\n');
  }

  if (style === 'wpp') {
    return [
      `[character("${identity.name}") {`,
      `  nickname("${identity.nickname}")`,
      `  age("${identity.age}")`,
      `  gender("${identity.gender}")`,
      `  species("${identity.species}")`,
      `  archetype("${identity.archetype}")`,
      `  appearance("${appearance.heightAndBuild}" + "${appearance.faceAndEyes}" + "${appearance.hair}" + "${appearance.distinctiveMarks}")`,
      `  clothing("${wardrobe.signatureOutfit}" + "${wardrobe.footwear}" + "${wardrobe.equipmentAndWeapons}")`,
      `  backstory("${background.backstory}")`,
      `  motivations("${background.motivations}")`,
      `}]`,
    ].join('\n');
  }

  // Raw default fallback
  return `${identity.name} - ${identity.archetype}\n${appearance.faceAndEyes}\n${wardrobe.signatureOutfit}\n${background.backstory}`;
}

/**
 * Compiles personality according to the chosen preset
 */
export function compilePersonality(profile: GranularCharacterProfile, style: FormattingStyle): string {
  const { personality, background } = profile;

  if (style === 'natural') {
    return [
      `### Personality & Psychological Profile`,
      `**Core Traits:** ${personality.coreTraits.join(', ')}`,
      personality.psychologicalProfile,
      ``,
      `**Likes:** ${personality.likes.join(', ')}`,
      `**Dislikes:** ${personality.dislikes.join(', ')}`,
      `**Habits & Quirks:** ${personality.quirksAndHabits.join('; ')}`,
      ``,
      `### Voice & Demeanor`,
      personality.speechMannerisms,
      ``,
      `### Relationship with {{user}}`,
      background.dynamicWithUser,
    ]
      .filter(line => line !== '')
      .join('\n');
  }

  if (style === 'boostily') {
    return [
      `[Personality: "${personality.coreTraits.join(', ')}"]`,
      `[Mind: "${personality.psychologicalProfile}"]`,
      `[Likes: "${personality.likes.join(', ')}"]`,
      `[Dislikes: "${personality.dislikes.join(', ')}"]`,
      `[Quirks: "${personality.quirksAndHabits.join(', ')}"]`,
      `[Speech: "${personality.speechMannerisms}"]`,
      `[Relationship with {{user}}: "${background.dynamicWithUser}"]`,
    ].join('\n');
  }

  if (style === 'wpp') {
    return [
      `[personality("${personality.coreTraits.join(' + ')}") {`,
      `  mind("${personality.psychologicalProfile}")`,
      `  speech("${personality.speechMannerisms}")`,
      `  likes("${personality.likes.join(' + ')}")`,
      `  dislikes("${personality.dislikes.join(' + ')}")`,
      `  quirks("${personality.quirksAndHabits.join(' + ')}")`,
      `  dynamic_with_user("${background.dynamicWithUser}")`,
      `}]`,
    ].join('\n');
  }

  return personality.coreTraits.join(', ') + '\n' + personality.psychologicalProfile;
}

/**
 * Compiles example dialogues
 */
export function compileExampleDialogues(profile: GranularCharacterProfile): string {
  const parts: string[] = [];
  if (profile.dialogues.casual) parts.push(profile.dialogues.casual.trim());
  if (profile.dialogues.conflict) parts.push(profile.dialogues.conflict.trim());
  if (profile.dialogues.vulnerable) parts.push(profile.dialogues.vulnerable.trim());
  if (profile.dialogues.customExamples) parts.push(profile.dialogues.customExamples.trim());

  return parts.join('\n\n');
}

/**
 * Compiles system prompt with selected narration style, formatting, and guardrails
 */
export function compileSystemPrompt(profile: GranularCharacterProfile): string {
  const directives: string[] = [];

  // 1. Perspective & Format
  if (profile.guardrails.povPerspective === 'first_person') {
    directives.push(`Write in the first-person perspective as {{char}} ("I looked", "my hands").`);
  } else {
    directives.push(
      profile.guardrails.pastTenseNarration
        ? `Write in third-person narrative past-tense ("{{char}} looked", "their hands").`
        : `Write in third-person narrative present-tense ("{{char}} looks", "their hands").`
    );
  }
  directives.push(`Format physical actions, micro-expressions, and environment in asterisks (*like this*), and spoken dialogue in double quotes ("like this").`);

  // 2. Narration Style
  if (profile.guardrails.narrationStyle === 'literary') {
    directives.push(
      `Adopt an atmospheric, literary prose style. Describe setting, physical micro-expressions, and emotional undertones with vivid sensory depth (lighting, sounds, scents, textures) before speaking.`
    );
  } else if (profile.guardrails.narrationStyle === 'cinematic') {
    directives.push(
      `Adopt a cinematic visual pacing with sharp camera-like framing. Focus on dynamic environmental interactions, spatial blocking, and rapid sensory beats.`
    );
  } else if (profile.guardrails.narrationStyle === 'visceral') {
    directives.push(
      `Adopt a raw, visceral narrative tone focusing on physiological sensations (heart rate, adrenaline, tension, physical touch, breathing patterns).`
    );
  } else if (profile.guardrails.narrationStyle === 'conversational') {
    directives.push(
      `Adopt a dialogue-focused, conversational style with sharp pacing, natural spoken rhythms, pauses, and concise physical gestures.`
    );
  }

  // 3. User Agency & Anti-Impersonation
  if (profile.guardrails.preventUserImpersonation) {
    directives.push(
      `Never write dialogue or actions on behalf of {{user}}. Focus entirely on {{char}}'s perspective and reactions, ending each turn with an action, question, or environmental beat that leaves initiative to {{user}}.`
    );
  }

  // Language & Dialect Enforcement
  if (profile.guardrails.languageDialect === 'hinglish') {
    directives.push(
      `[CRITICAL LANGUAGE REQUIREMENT: Strictly speak and narrate in natural conversational Hinglish using the Latin/Roman alphabet (Hindi written in English letters, e.g. "Arre yaar", "Kya kar rahe ho?"). Both spoken dialogue in quotes and narrative descriptions in asterisks must maintain authentic Hinglish phrasing. Never revert to pure English or Devanagari script.]`
    );
  } else if (profile.guardrails.languageDialect === 'custom' && profile.guardrails.customLanguage) {
    directives.push(
      `[CRITICAL LANGUAGE REQUIREMENT: Strictly converse and narrate in ${profile.guardrails.customLanguage}. Maintain this language/dialect uniformly across all turns.]`
    );
  }

  // 4. Custom System Directives
  if (profile.guardrails.customSystemPrompt) {
    directives.push(profile.guardrails.customSystemPrompt);
  }

  return directives.join('\n');
}

/**
 * Compiles post-history depth prompt instructions for active plot steering and turn pacing
 */
export function compilePostHistoryInstructions(profile: GranularCharacterProfile): string {
  const instructions: string[] = [];

  // Pacing
  if (profile.guardrails.pacingRule === 'slow_burn') {
    instructions.push(`[Pacing: Maintain a measured, slow-burn pace. Do not rush time forward or resolve scene tension in a single turn.]`);
  } else if (profile.guardrails.pacingRule === 'fast_paced') {
    instructions.push(`[Pacing: Keep narrative momentum high. Escalate immediate consequences and introduce dynamic scene developments.]`);
  }

  // Story Direction & Goal
  if (profile.guardrails.storyGoalAndDirection && profile.guardrails.storyGoalAndDirection.trim()) {
    instructions.push(`[Narrative Direction: ${profile.guardrails.storyGoalAndDirection.trim()}. Actively steer {{char}}'s choices and dialogue toward this objective without forcing {{user}}'s reactions.]`);
  }

  // Language Lock
  if (profile.guardrails.languageDialect === 'hinglish') {
    instructions.push(`[Language Lock: Maintain 100% natural conversational Hinglish in Roman/Latin script for both dialogue and narrative actions. Do not slip into pure English.]`);
  }

  // Agency reminder at depth
  if (profile.guardrails.preventUserImpersonation) {
    instructions.push(`[Never write or speak for {{user}}.]`);
  }

  if (profile.guardrails.postHistoryInstructions && profile.guardrails.postHistoryInstructions.trim()) {
    instructions.push(profile.guardrails.postHistoryInstructions.trim());
  }

  return instructions.join('\n');
}

/**
 * Compiles full Granular Profile into a valid SillyTavern V2 Character Card
 */
export function profileToV2Card(profile: GranularCharacterProfile, style: FormattingStyle = 'natural'): CharacterCardV2 {
  return {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data: {
      name: profile.identity.name,
      description: compileDescription(profile, style),
      personality: compilePersonality(profile, style),
      scenario: profile.scenario.environmentAndContext,
      first_mes: profile.scenario.firstMessage,
      mes_example: compileExampleDialogues(profile),
      creator_notes: profile.guardrails.creatorNotes,
      system_prompt: compileSystemPrompt(profile),
      post_history_instructions: compilePostHistoryInstructions(profile),
      alternate_greetings: profile.scenario.alternateGreetings,
      character_book: {
        name: `${profile.identity.name} Lorebook`,
        description: `Embedded lore and world information for ${profile.identity.name}`,
        scan_depth: 100,
        token_budget: 600,
        recursive_scanning: true,
        extensions: {},
        entries: profile.lorebook,
      },
      tags: profile.identity.tags,
      creator: profile.identity.creator,
      character_version: profile.identity.version,
      extensions: {},
    },
  };
}

/**
 * Smartly maps imported V2 or V1 card data into Granular Profile
 */
export function v2CardToProfile(card: CharacterCardV2 | CharacterDataV2 | CharacterCardV1 | Record<string, unknown>, avatarUrl: string = ''): GranularCharacterProfile {
  const data: Partial<CharacterDataV2> = 'data' in card && typeof card.data === 'object' && card.data !== null
    ? (card.data as CharacterDataV2)
    : (card as unknown as CharacterDataV2);

  const defaultProfile = createDefaultProfile();

  const name = data.name || defaultProfile.identity.name;
  const description = data.description || '';
  const personality = data.personality || '';

  return {
    identity: {
      name,
      nickname: '',
      age: '',
      gender: '',
      species: '',
      archetype: '',
      creator: data.creator || '',
      version: data.character_version || '1.0',
      tags: Array.isArray(data.tags) ? data.tags : [],
      avatarUrl: avatarUrl || defaultProfile.identity.avatarUrl,
    },
    appearance: {
      heightAndBuild: '',
      faceAndEyes: '',
      hair: '',
      complexion: '',
      distinctiveMarks: '',
      generalImpressions: description,
    },
    wardrobe: {
      signatureOutfit: '',
      footwear: '',
      accessoriesAndJewelry: '',
      equipmentAndWeapons: '',
      alternateOutfits: '',
    },
    personality: {
      coreTraits: [],
      psychologicalProfile: personality,
      likes: [],
      dislikes: [],
      quirksAndHabits: [],
      speechMannerisms: '',
    },
    background: {
      backstory: '',
      currentOccupation: '',
      motivations: '',
      secrets: '',
      dynamicWithUser: '',
    },
    scenario: {
      environmentAndContext: data.scenario || '',
      firstMessage: data.first_mes || '',
      alternateGreetings: Array.isArray(data.alternate_greetings) ? data.alternate_greetings : [],
    },
    dialogues: {
      casual: data.mes_example || '',
      conflict: '',
      vulnerable: '',
      customExamples: '',
    },
    lorebook: data.character_book?.entries && Array.isArray(data.character_book.entries)
      ? data.character_book.entries
      : [],
    guardrails: {
      languageDialect: 'english',
      narrationStyle: 'literary',
      povPerspective: 'third_person',
      pacingRule: 'slow_burn',
      storyGoalAndDirection: '',
      preventUserImpersonation: true,
      immersiveProseStyle: true,
      pastTenseNarration: true,
      customSystemPrompt: data.system_prompt || '',
      postHistoryInstructions: data.post_history_instructions || '',
      creatorNotes: data.creator_notes || '',
    },
  };
}
