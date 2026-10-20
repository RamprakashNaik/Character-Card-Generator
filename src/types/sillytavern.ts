/**
 * SillyTavern Character Card V2 Specification Types
 * Reference: https://github.com/SillyTavern/SillyTavern
 */

export interface CharacterCardV2 {
  spec: 'chara_card_v2';
  spec_version: '2.0';
  data: CharacterDataV2;
}

export interface CharacterDataV2 {
  name: string;
  description: string;
  personality: string;
  scenario: string;
  first_mes: string;
  mes_example: string;
  creator_notes: string;
  system_prompt: string;
  post_history_instructions: string;
  alternate_greetings: string[];
  character_book?: CharacterBook;
  tags: string[];
  creator: string;
  character_version: string;
  extensions: Record<string, unknown>;
}

export interface CharacterBook {
  name?: string;
  description?: string;
  scan_depth?: number;
  token_budget?: number;
  recursive_scanning?: boolean;
  extensions?: Record<string, unknown>;
  entries: LorebookEntry[];
}

export interface LorebookEntry {
  id: number;
  keys: string[];
  secondary_keys?: string[];
  comment?: string;
  content: string;
  constant?: boolean;
  selective?: boolean;
  insertion_order: number;
  enabled: boolean;
  position?: 'before_char' | 'after_char';
}

/**
 * Legacy SillyTavern V1 Card Format (for backwards-compatible import)
 */
export interface CharacterCardV1 {
  name: string;
  description: string;
  personality: string;
  scenario: string;
  first_mes: string;
  mes_example: string;
  creator_notes?: string;
  system_prompt?: string;
  post_history_instructions?: string;
  alternate_greetings?: string[];
  tags?: string[];
  creator?: string;
  character_version?: string;
}

/**
 * High-Detail Granular Profile for Professional Authoring
 */
export interface GranularCharacterProfile {
  // 1. Identity & Demographics
  identity: {
    name: string;
    nickname: string;
    age: string;
    gender: string;
    species: string;
    archetype: string;
    creator: string;
    version: string;
    tags: string[];
    avatarUrl: string; // Base64 data URL or external URL
  };

  // 2. Physical Appearance ("How they look")
  appearance: {
    heightAndBuild: string;
    faceAndEyes: string;
    hair: string;
    complexion: string;
    distinctiveMarks: string; // scars, tattoos, piercings, cybernetics
    generalImpressions: string;
  };

  // 3. Wardrobe & Gear ("What they wear")
  wardrobe: {
    signatureOutfit: string;
    footwear: string;
    accessoriesAndJewelry: string;
    equipmentAndWeapons: string;
    alternateOutfits: string;
  };

  // 4. Personality & Voice
  personality: {
    coreTraits: string[];
    psychologicalProfile: string;
    likes: string[];
    dislikes: string[];
    quirksAndHabits: string[];
    speechMannerisms: string; // tone, accent, verbal tics, pacing
  };

  // 5. Lore & Background
  background: {
    backstory: string;
    currentOccupation: string;
    motivations: string;
    secrets: string;
    dynamicWithUser: string;
  };

  // 6. Scenario & Greetings
  scenario: {
    environmentAndContext: string;
    firstMessage: string;
    alternateGreetings: string[];
  };

  // 7. Example Dialogues (<START> multi-turn blocks)
  dialogues: {
    casual: string;
    conflict: string;
    vulnerable: string;
    customExamples: string;
  };

  // 8. World Info & Lorebook
  lorebook: LorebookEntry[];

  // 9. Directives, Narration Style & Story Direction
  guardrails: {
    narrationStyle: 'literary' | 'cinematic' | 'conversational' | 'visceral';
    povPerspective: 'third_person' | 'first_person';
    pacingRule: 'slow_burn' | 'balanced' | 'fast_paced';
    storyGoalAndDirection: string; // Where the roleplay should steer / main objective
    preventUserImpersonation: boolean;
    immersiveProseStyle: boolean;
    pastTenseNarration: boolean;
    customSystemPrompt: string;
    postHistoryInstructions: string;
    creatorNotes: string;
  };
}

export type FormattingStyle = 'natural' | 'boostily' | 'wpp' | 'raw';
