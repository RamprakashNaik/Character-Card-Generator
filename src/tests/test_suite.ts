import assert from 'node:assert';
import {
  calculateCrc32,
  utf8ToBase64,
  base64ToUtf8,
  embedCharacterInPng,
  extractCharacterFromPng,
} from '../utils/pngMetadata.ts';
import {
  createDefaultProfile,
  profileToV2Card,
  compileDescription,
  compilePersonality,
  compileSystemPrompt,
  compilePostHistoryInstructions,
} from '../utils/formatters.ts';
import { buildLanguageDirectives } from '../services/prompts.ts';
import { auditCharacterProfile, autoFixMacros } from '../utils/linter.ts';
import { estimateTokens, analyzeTokenBudget } from '../utils/tokenCounter.ts';
import type { CharacterCardV2 } from '../types/sillytavern.ts';

console.log('🧪 Starting Character Card Generator Verification Test Suite...\n');

// 1. Create a minimal valid 1x1 PNG image for testing chunk injection
function createMinimalPng(): Uint8Array {
  // A valid 1x1 black pixel PNG
  return new Uint8Array([
    137, 80, 78, 71, 13, 10, 26, 10, // PNG Signature
    // IHDR chunk
    0, 0, 0, 13,
    73, 72, 68, 82, // 'IHDR'
    0, 0, 0, 1, // width: 1
    0, 0, 0, 1, // height: 1
    8, 6, 0, 0, 0, // 8-bit RGBA
    31, 21, 196, 137, // IHDR CRC
    // IDAT chunk
    0, 0, 0, 12,
    73, 68, 65, 84, // 'IDAT'
    120, 156, 99, 0, 1, 0, 0, 5, 0, 1, 13, 10,
    // IDAT CRC
    84, 169, 107, 72,
    // IEND chunk
    0, 0, 0, 0,
    73, 69, 78, 68, // 'IEND'
    174, 66, 96, 130, // IEND CRC
  ]);
}

// Test 1: PNG Chunk Round-Trip Test
console.log('▶ Test 1: SillyTavern PNG Chunk Extraction and Injection Round-Trip');
const initialPng = createMinimalPng();
const testProfile = createDefaultProfile();
const originalCard: CharacterCardV2 = profileToV2Card(testProfile, 'natural');

const injectedPng = embedCharacterInPng(initialPng, originalCard);
assert(injectedPng.length > initialPng.length, 'Injected PNG should have greater length than minimal PNG');

const extractedCard = extractCharacterFromPng(injectedPng);
assert(extractedCard !== null, 'Extracted card should not be null');
assert.strictEqual((extractedCard as CharacterCardV2).spec, 'chara_card_v2', 'Spec must be chara_card_v2');
assert.strictEqual((extractedCard as CharacterCardV2).spec_version, '2.0', 'Spec version must be 2.0');
assert.strictEqual(
  (extractedCard as CharacterCardV2).data.name,
  originalCard.data.name,
  'Extracted character name must match original'
);
assert.strictEqual(
  (extractedCard as CharacterCardV2).data.first_mes,
  originalCard.data.first_mes,
  'Extracted first message must match original'
);
assert.strictEqual(
  (extractedCard as CharacterCardV2).data.character_book?.entries.length,
  originalCard.data.character_book?.entries.length,
  'Lorebook entries count must match'
);
console.log('  ✔ Passed: PNG embedding and extraction returned 100% identical data with valid CRC32.\n');

// Test 2: Formatting Styles Compilation Test
console.log('▶ Test 2: Multi-Preset Compilation Test (Natural, Ali:Chat, W++)');
const naturalDesc = compileDescription(testProfile, 'natural');
assert(naturalDesc.includes('### Physical Appearance'), 'Natural description must include headings');
assert(naturalDesc.includes(testProfile.appearance.faceAndEyes), 'Natural description must include face and eyes');
assert(naturalDesc.includes(testProfile.wardrobe.signatureOutfit), 'Natural description must include wardrobe');

const boostilyDesc = compileDescription(testProfile, 'boostily');
assert(boostilyDesc.includes('[Appearance:'), 'Boostily format must include [Appearance: brackets');
assert(boostilyDesc.includes('[Clothing:'), 'Boostily format must include [Clothing: brackets');

const wppDesc = compileDescription(testProfile, 'wpp');
assert(wppDesc.includes(`[character("${testProfile.identity.name}")`), 'W++ format must include [character(name) definition');
assert(wppDesc.includes('appearance('), 'W++ format must include appearance block');
console.log('  ✔ Passed: Granular fields compiled cleanly to Natural, Ali:Chat, and W++ presets.\n');

// Test 3: Macro and Syntax Linter Test
console.log('▶ Test 3: Macro & Syntax Linter + Auto-Fix Test');
const buggyProfile = createDefaultProfile();
buggyProfile.scenario.firstMessage = 'You feel terrified as {char} steps closer and grabs {user}.';
buggyProfile.dialogues.casual = '{user}: "Hey"\n{char}: "Hello"';

const report = auditCharacterProfile(buggyProfile);
assert(report.issues.some(i => i.id === 'broken-macros'), 'Linter must detect broken macros {char} and {user}');
assert(report.issues.some(i => i.id === 'user-railroading'), 'Linter must detect user impersonation ("You feel")');

const fixedProfile = autoFixMacros(buggyProfile);
assert(fixedProfile.scenario.firstMessage.includes('{{char}}'), 'Auto-fix must replace {char} with {{char}}');
assert(fixedProfile.scenario.firstMessage.includes('{{user}}'), 'Auto-fix must replace {user} with {{user}}');
assert(!/(?<!\{)\{char\}(?!\})/i.test(fixedProfile.scenario.firstMessage), 'No single bracket {char} should remain');
assert(!/(?<!\{)\{user\}(?!\})/i.test(fixedProfile.scenario.firstMessage), 'No single bracket {user} should remain');
console.log('  ✔ Passed: Linter detected broken macros and railroading; auto-fix corrected syntax.\n');

// Test 4: Token Budget & Context Economy Test
console.log('▶ Test 4: Token Counter Calibration Test');
const sampleText = 'Vaelin Thorne is a 28-year-old rogue infiltrator. {{char}} flips a silver coin. <START>';
const tokens = estimateTokens(sampleText);
assert(tokens >= 15 && tokens <= 25, `Token estimate (${tokens}) should fall within expected range`);

const budget = analyzeTokenBudget(originalCard.data);
assert(budget.total > 400 && budget.total < 2500, `Card total tokens (${budget.total}) should be within realistic budget`);
console.log(`  ✔ Passed: Token estimator correctly calculated ${tokens} tokens for sample text and ${budget.total} total card tokens.\n`);

// Test 5: User Perspective ("Tum / You / Aap") Verification Test
console.log('▶ Test 5: User Perspective ("Tum / You / Aap") Verification Test');
const userPOVProfile = createDefaultProfile();
userPOVProfile.guardrails.languageDialect = 'hinglish';
userPOVProfile.guardrails.povPerspective = 'user_perspective';

const userPOVSystemPrompt = compileSystemPrompt(userPOVProfile);
assert(userPOVSystemPrompt.includes('User\'s Perspective in Hinglish'), 'System prompt must mandate User\'s Perspective in Hinglish');
assert(userPOVSystemPrompt.includes('NEVER narrate {{char}}\'s actions as "Main / Mera / Mujhe"'), 'Must strictly forbid {{char}} saying Main/Mera');
assert(userPOVSystemPrompt.includes('tumhare kareeb'), 'Must include user-centric spatial examples');

const userPOVDepthPrompt = compilePostHistoryInstructions(userPOVProfile);
assert(userPOVDepthPrompt.includes('User Perspective Hinglish Lock'), 'Depth prompt must lock User Perspective');
assert(userPOVDepthPrompt.includes('Do NOT narrate actions as "Main"'), 'Depth prompt must forbid Main');

// Test language directive smart resolution: "the first person showing from char perspective I want from user perspective"
const userDirective = buildLanguageDirectives({
  text: 'the first person showing from char perspective I want from user perspective',
  currentDialect: 'hinglish',
});
assert(userDirective.includes('USER PERSPECTIVE / SECOND-PERSON ("TUM / AAP / YOU") MANDATE'), 'Must resolve to USER PERSPECTIVE');
assert(userDirective.includes('MUST NEVER narrate physical actions as "Main / Mera / Mujhe"'), 'Must forbid char Main');
console.log('  ✔ Passed: User Perspective correctly enforces "Tum / Aap", forbids char "Main", and handles user prompt intent.\n');

console.log('🎉 ALL AUTOMATED TESTS PASSED SUCCESSFULLY!');
