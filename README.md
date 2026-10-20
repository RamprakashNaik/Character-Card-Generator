# SillyTavern Character Card Studio

An AI-powered, professional-grade Character Card Generator and Optimizer built for **SillyTavern V2**, **TavernAI**, **Chub.ai**, and **Agnaistic**.

Connects seamlessly with any **OpenAI-compatible LLM endpoint** (OpenRouter, Groq, OpenAI, LM Studio, Ollama, Together, DeepSeek) to brainstorm, author, critique, test, and export cards in both **PNG (with embedded metadata)** and **JSON** formats.

---

## ✨ Features

- **"Base Idea to World & Character" Co-Pilot**:
  - Provide a single concept premise (e.g. *"A cynical steampunk airship captain carrying a whispering forbidden crystal"*).
  - Automatically synthesizes all granular identity fields, appearance, wardrobe, voice, and **3–5 interconnected World Lorebook entries**.
- **Granular Authoring Sections**:
  - **Identity**: Name, Nicknames, Age, Gender, Species, Archetype, Tags, Avatar.
  - **How They Look (Appearance)**: Height & Build, Facial features, Eye color/expression, Hair style/texture, Complexion, Distinctive marks (scars, tattoos, cybernetics), and Physical aura.
  - **What They Wear (Wardrobe & Gear)**: Signature outfit, Footwear, Accessories/Jewelry, Weapons & Equipment, Alternate attire.
  - **Personality & Voice**: Defining traits, Psychological profile, Likes, Dislikes, Habits/Quirks, Speech cadence, accent, and verbal mannerisms.
  - **Background & Lore**: Formative backstory, Current occupation, Driving goals, Hidden secrets, and Dynamic with `{{user}}`.
  - **Dialogue & Scene**: Starting context, First Message (`first_mes`) with anti-impersonation agency guard, and Alternate Greetings.
  - **3-Scenario Voice Dialogues**: Multi-turn `<START>` blocks for *Casual*, *Conflict / Pressure*, and *Vulnerable* roleplay.
  - **Embedded World Info / Lorebook**: Searchable entries with primary & secondary trigger keys.
- **Per-Section AI Refinement ("✨ Refine with AI")**:
  - Don't like a specific section? Click "Refine with AI", type your exact preference (e.g. *"Make his coat worn black leather with brass gears"*), preview the change side-by-side, and apply with 1 click.
- **6-Point Professional Quality Auditor**:
  - Macro validator (`{{char}}`, `{{user}}` check with 1-click auto-fix).
  - Anti-railroading / User agency checker.
  - Example dialogue `<START>` formatting check.
  - Real-time token budget heatmap (calibrated for the 800–1,600 token sweet spot).
- **Interactive Live Test Sandbox**:
  - Roleplay and test dialogue with your character directly inside the app before exporting!
- **SillyTavern PNG & JSON Bidirectional Engine**:
  - Exports standard PNG cards with embedded base64 `chara` chunks (drag-and-drop straight into SillyTavern).
  - Exports clean SillyTavern V2 JSON.
  - Imports any existing `.png` or `.json` character card with drag-and-drop anywhere.
- **Mobile-Friendly & Responsive**:
  - Adaptive layout with touch-friendly scrollable tabs, bottom sheets, and mobile chat interface.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/RamprakashNaik/Character-Card-Generator.git
cd Character-Card-Generator

# Install dependencies
npm install
```

### Running Locally
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Running Automated Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

---

## 🔌 Connecting to AI Endpoints

Click the **Gear** icon in the navbar to open **Settings**:

| Provider | Base URL | Note |
| :--- | :--- | :--- |
| **OpenRouter** | `https://openrouter.ai/api/v1` | Recommended for roleplay (Claude 3.5 Sonnet, Llama 3.3 70B) |
| **Groq** | `https://api.groq.com/openai/v1` | Ultra-fast streaming generation |
| **OpenAI** | `https://api.openai.com/v1` | GPT-4o, GPT-4o-mini |
| **LM Studio** | `http://localhost:1234/v1` | Ensure CORS is enabled in LM Studio settings |
| **Ollama** | `http://localhost:11434/v1` | Set `OLLAMA_ORIGINS="*"` before running `ollama serve` |

---

## 📜 License
MIT License.
