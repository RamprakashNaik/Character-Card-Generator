/**
 * Pure TypeScript PNG Chunk Reader and Writer for SillyTavern Character Cards
 * 100% compliant with standard PNG RFC 2083 and SillyTavern V2 spec.
 */

import { CharacterCardV2, CharacterCardV1 } from '../types/sillytavern';

// Pre-computed CRC32 lookup table
const crcTable: Uint32Array = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    table[n] = c;
  }
  return table;
})();

function calculateCrc32(data: Uint8Array, offset: number, length: number): number {
  let crc = 0xffffffff;
  for (let i = offset; i < offset + length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Robust UTF-8 safe base64 encoding
 */
export function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Robust UTF-8 safe base64 decoding
 */
export function base64ToUtf8(base64: string): string {
  // Clean up any potential whitespace/newlines in base64 string
  const clean = base64.replace(/[\r\n\s]/g, '');
  const binary = atob(clean);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder('utf-8').decode(bytes);
}

interface PngChunk {
  type: string;
  data: Uint8Array;
  crc: number;
}

const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

function isPng(data: Uint8Array): boolean {
  if (data.length < 8) return false;
  for (let i = 0; i < 8; i++) {
    if (data[i] !== PNG_SIGNATURE[i]) return false;
  }
  return true;
}

/**
 * Parses all chunks from raw PNG byte array
 */
function extractChunks(buffer: Uint8Array): PngChunk[] {
  if (!isPng(buffer)) {
    throw new Error('File is not a valid PNG image');
  }

  const chunks: PngChunk[] = [];
  let pos = 8;
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  while (pos < buffer.length) {
    if (pos + 8 > buffer.length) break;

    const length = view.getUint32(pos, false);
    pos += 4;

    const typeBytes = buffer.subarray(pos, pos + 4);
    const type = String.fromCharCode(...typeBytes);
    pos += 4;

    if (pos + length + 4 > buffer.length) {
      throw new Error(`Corrupted PNG chunk ${type} at position ${pos}`);
    }

    const data = buffer.slice(pos, pos + length);
    pos += length;

    const crc = view.getUint32(pos, false);
    pos += 4;

    chunks.push({ type, data, crc });

    if (type === 'IEND') break;
  }

  return chunks;
}

/**
 * Extracts character card JSON from a SillyTavern PNG file
 */
export function extractCharacterFromPng(pngBytes: Uint8Array): CharacterCardV2 | CharacterCardV1 | null {
  const chunks = extractChunks(pngBytes);

  for (const chunk of chunks) {
    if (chunk.type === 'tEXt') {
      // tEXt format: keyword + null separator (0) + text
      const nullIndex = chunk.data.indexOf(0);
      if (nullIndex === -1) continue;

      const keyword = String.fromCharCode(...chunk.data.subarray(0, nullIndex));
      if (keyword.toLowerCase() === 'chara') {
        const textBytes = chunk.data.subarray(nullIndex + 1);
        let rawText = '';
        for (let i = 0; i < textBytes.length; i++) {
          rawText += String.fromCharCode(textBytes[i]);
        }

        try {
          const decodedJson = base64ToUtf8(rawText);
          const parsed = JSON.parse(decodedJson);
          return parsed;
        } catch {
          // If not base64 encoded, try parsing directly as raw JSON
          try {
            const rawUtf8 = new TextDecoder().decode(textBytes);
            return JSON.parse(rawUtf8);
          } catch (e) {
            console.error('Failed to parse chara chunk:', e);
          }
        }
      }
    } else if (chunk.type === 'iTXt') {
      // iTXt format: keyword\0 compressionFlag\0 compressionMethod\0 lang\0 transKey\0 text
      const nullIndex = chunk.data.indexOf(0);
      if (nullIndex === -1) continue;

      const keyword = String.fromCharCode(...chunk.data.subarray(0, nullIndex));
      if (keyword.toLowerCase() === 'chara') {
        // Find next parts
        let ptr = nullIndex + 1;
        // compression flag (1) + compression method (1)
        ptr += 2;
        // lang tag null
        while (ptr < chunk.data.length && chunk.data[ptr] !== 0) ptr++;
        ptr++; // skip null
        // translated keyword null
        while (ptr < chunk.data.length && chunk.data[ptr] !== 0) ptr++;
        ptr++; // skip null

        const textBytes = chunk.data.subarray(ptr);
        const rawText = new TextDecoder('utf-8').decode(textBytes);
        try {
          const decoded = base64ToUtf8(rawText);
          return JSON.parse(decoded);
        } catch {
          try {
            return JSON.parse(rawText);
          } catch (e) {
            console.error('Failed to parse iTXt chara chunk:', e);
          }
        }
      }
    }
  }

  return null;
}

/**
 * Creates a PNG tEXt chunk with the given keyword and value
 */
function createTextChunk(keyword: string, text: string): PngChunk {
  const encoder = new TextEncoder();
  const keywordBytes = encoder.encode(keyword);
  const textBytes = encoder.encode(text);

  const data = new Uint8Array(keywordBytes.length + 1 + textBytes.length);
  data.set(keywordBytes, 0);
  data[keywordBytes.length] = 0; // null separator
  data.set(textBytes, keywordBytes.length + 1);

  // Compute CRC over Type ('tEXt') + Data
  const typeBytes = encoder.encode('tEXt');
  const forCrc = new Uint8Array(4 + data.length);
  forCrc.set(typeBytes, 0);
  forCrc.set(data, 4);

  const crc = calculateCrc32(forCrc, 0, forCrc.length);

  return {
    type: 'tEXt',
    data,
    crc,
  };
}

/**
 * Embeds SillyTavern V2 Character Card into a PNG image Uint8Array
 */
export function embedCharacterInPng(pngBytes: Uint8Array, card: CharacterCardV2): Uint8Array {
  const chunks = extractChunks(pngBytes);

  // 1. Remove any existing chara / ccv3 chunks
  const filteredChunks = chunks.filter(c => {
    if (c.type === 'tEXt' || c.type === 'iTXt') {
      const nullIdx = c.data.indexOf(0);
      if (nullIdx !== -1) {
        const kw = String.fromCharCode(...c.data.subarray(0, nullIdx)).toLowerCase();
        if (kw === 'chara' || kw === 'ccv3') return false;
      }
    }
    return true;
  });

  // 2. Prepare base64-encoded V2 card JSON
  const jsonString = JSON.stringify(card);
  const base64Data = utf8ToBase64(jsonString);

  // 3. Create the new chara tEXt chunk
  const charaChunk = createTextChunk('chara', base64Data);

  // 4. Find index of IEND chunk and insert right before it
  const iendIndex = filteredChunks.findIndex(c => c.type === 'IEND');
  if (iendIndex === -1) {
    throw new Error('Invalid PNG: Missing IEND chunk');
  }

  filteredChunks.splice(iendIndex, 0, charaChunk);

  // 5. Calculate total byte size of new PNG
  // 8 bytes signature + for each chunk: 4 (len) + 4 (type) + data.length + 4 (crc)
  let totalLength = 8;
  for (const chunk of filteredChunks) {
    totalLength += 12 + chunk.data.length;
  }

  const result = new Uint8Array(totalLength);
  result.set(PNG_SIGNATURE, 0);

  let offset = 8;
  const view = new DataView(result.buffer);

  for (const chunk of filteredChunks) {
    // Length (4 bytes)
    view.setUint32(offset, chunk.data.length, false);
    offset += 4;

    // Type (4 bytes)
    for (let i = 0; i < 4; i++) {
      result[offset + i] = chunk.type.charCodeAt(i);
    }
    offset += 4;

    // Data (data.length bytes)
    result.set(chunk.data, offset);
    offset += chunk.data.length;

    // CRC (4 bytes)
    view.setUint32(offset, chunk.crc, false);
    offset += 4;
  }

  return result;
}

/**
 * Generates a clean fallback placeholder avatar PNG (512x512) if none was uploaded
 */
export async function createPlaceholderAvatar(name: string, archetype?: string): Promise<Uint8Array> {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Elegant dark gradient background
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(0.5, '#312e81');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Decorative circle
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(256, 210, 110, 0, Math.PI * 2);
    ctx.stroke();

    // Initials
    const initials = name
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'CC';

    ctx.fillStyle = '#e0e7ff';
    ctx.font = 'bold 84px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 256, 210);

    // Name label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px system-ui, sans-serif';
    ctx.fillText(name.substring(0, 24) || 'Character', 256, 380);

    // Archetype / Subtitle
    if (archetype) {
      ctx.fillStyle = '#a5b4fc';
      ctx.font = '20px system-ui, sans-serif';
      ctx.fillText(archetype.substring(0, 32), 256, 424);
    }
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('Failed to create canvas blob'));
        return;
      }
      blob.arrayBuffer().then(buf => resolve(new Uint8Array(buf)));
    }, 'image/png');
  });
}
