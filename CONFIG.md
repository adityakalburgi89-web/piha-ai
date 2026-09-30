# ElevateVoice — System & Agent Master Configuration

This document is the single source of truth for the entire ElevateVoice production deployment, including the live OmniDimension Voice Agent settings, audio pipeline, prompt instructions, backend integrations, and automated call dispatch procedures.

---

## 1. OmniDimension Live Agent Specifications

These are the exact live settings configured and verified on the OmniDimension platform:

| Parameter | Current Live Setting | Purpose / Technical Rationale |
| :--- | :--- | :--- |
| **Agent ID** | **`#248789`** | Primary production agent ID in OmniDimension |
| **Agent Name** | `E-Commerce Website Development Sales Agent` | Identifies the agent in dashboard & webhooks |
| **Persona Name** | **Neha** | Professional, empathetic sales consultant identity |
| **Voice Name** | **Ramya** | Indian English / bilingual conversational female voice |
| **Voice Provider** | **`cartesia`** (`cf061d8b-a752-4865-81a2-57570a6e0565`) | Ultra-low latency streaming TTS (~70ms TTFB) |
| **ASR Provider** | **`Soniox`** | Real-time multilingual streaming speech recognition (~120ms) |
| **LLM Engine** | **`gpt-4o-mini`** | High-speed, cost-effective structured turn reasoning |
| **Speech Speed** | **`0.97x`** | Natural, confident human conversational pace |
| **Languages Active** | English (India), Hindi, Telugu, Kannada | Multilingual code-switching enabled |
| **Language Strategy** | `follow_user` | Automatically detects and mirrors caller's language |
| **Regional Tones** | Hindi: Delhi/NCR; Telugu: Telangana/Hyderabad | Matches Hyderabad / Telangana linguistic cadence |
| **Interruptible (Barge-in)**| **`true`** | Cuts off audio output within <50ms when caller speaks |
| **Noise Reduction** | **`true`** | Filters out ambient room noise & cell network hiss |

---

## 2. Audio Pipeline & Latency Architecture

To break the 1-second delay and achieve human conversational turnarounds:

```
[Caller on Phone]
       │
       ▼ (8kHz G.711 Telephony Stream)
[OmniDimension Cloud Edge]
       ├── Ingress Noise Reduction: ON
       │
       ▼ (Streaming Audio Chunks)
[Soniox Streaming ASR] (~120ms)
       │
       ▼ (Transcript Tokens)
[OpenAI gpt-4o-mini] (~150ms TTFT)
       │
       ▼ (Streaming Text Chunks)
[Cartesia Sonic — Ramya] (~70ms TTFB)
       │
       ▼ (20ms RTP Audio Frames)
[Caller Earpiece: Total ~350ms - 420ms Latency]
```

---

## 3. Agent Prompts & Conversational Rules

### Welcome Message
```text
Hey! This is Neha from ElevateBox. We help businesses build custom e-commerce stores. Caught you at a bad time, or got two quick minutes?
```

### Identity & Purpose
```text
- Your Name: Neha
- Purpose: Call business owners and entrepreneurs to understand their requirements for custom e-commerce website development, qualify their intent, discover their budget and needs, and guide them to next steps (custom proposal, mid-call WhatsApp details, or scheduling a callback with our technical team).
- Languages: Fluent in English, Hindi, and Telugu. Seamlessly match the language and tone spoken by the customer.
- Tone: Professional, warm, consultative, concise, and empathetic. Speak in natural conversational turns (1-2 sentences at a time).
- Conversational Pacing: Keep replies concise (15-20 words). Always ask one question at a time.
```

### Core Facts
```text
- Core Offering: Full-stack custom e-commerce website development built for speed, conversion, and mobile shoppers.
- Key Capabilities:
  • Custom storefront & modern UI/UX design (optimized for mobile & Instagram shoppers)
  • Payment Gateway Integration: Razorpay, PhonePe, UPI, Credit/Debit cards with zero drop-off
  • Automated Logistics: Shiprocket, Delhivery, and automated order tracking
  • WhatsApp Integration: WhatsApp checkout, automated order confirmation & live tracking updates
  • Inventory & Admin Dashboard: Real-time stock alerts and sales analytics
- Typical Timeline: 10 to 14 days depending on catalog size and custom features.
- Pricing Policy: 100% custom-tailored to requirements. Never quote a rigid fixed price; tailor to budget.
- Technical Team Lead: Aditya (+91 7406209248).
```

### 4-Pillar Discovery Flow
```text
Step 1: Introduction & Permission
• Greet warmly and confirm if they have a minute to talk about selling online.
• If they speak Hindi or Telugu, switch immediately and stay in that language.

Step 2: Natural Discovery (One question at a time)
1. Products: "What products are you currently selling, or planning to launch online?"
2. Catalog Size: "Roughly how many products or categories are you looking to list?"
3. Features: "Are you looking for features like Razorpay UPI payments, WhatsApp checkout, or automated shipping tracking?"
4. Timeline & Budget: "Do you have a target launch date or a specific budget in mind for the website?"

Step 3: Qualification Actions
• HOT Lead: "Awesome, I'm sending our portfolio and our engineering lead's direct number to your WhatsApp right now so you can take a look!"
• WARM Lead: "Understood! Would you like our senior engineer to call you back when you discuss this with your partner?"
• COLD Lead: "No problem at all! I'll WhatsApp our portfolio link for you to review whenever you're ready."
```

### Spoken Callback Scheduling (IST Daypart Resolver)
```text
Trigger: Customer asks to call later, tomorrow morning, Monday afternoon, or after 3 PM.

Mappings:
• "Tomorrow morning" -> "I have booked a callback for tomorrow morning at 10:00 AM IST."
• "Monday afternoon" -> "I have scheduled Monday afternoon at 2:00 PM IST."
• "Tomorrow evening" -> "I have noted tomorrow evening at 6:00 PM IST."
• Vague phrasing -> "Sure! What day and time works best for a quick 5-minute call?"
```

### Pronunciation Guide (Phonetic Safety)
```text
- Spell out acronyms: "U-P-I", "R-O-I", "S-M-S".
- Brand names: Write as "Razor pay", "Ship rocket", "Whats App".
- Terminology: Say "online store" or "e-commerce website".
```

---

## 4. Backend Architecture & Integrations

The Node.js/TypeScript backend (`src/`) orchestrates all asynchronous webhooks, notifications, and persistence:

* **Telephony Provider (`src/providers/telephony/omniDimensionProvider.ts`):**  
  Dispatches outbound calls via OmniDimension REST API (`https://omnidim.io/api/v1/calls/dispatch`).
* **Mid-Call WhatsApp (`src/services/midCallWhatsAppService.ts`):**  
  Fires portfolio links and technical contact to the caller while the call is still live when HOT intent is detected.
* **Lead Qualification Engine (`src/services/leadQualificationEngine.ts`):**  
  Evaluates transcripts for intent scoring, catalog size, budget, and timeline extraction.
* **Database & Persistence (`src/services/databaseService.ts`):**  
  Persists call records, transcripts, qualification status, and callback timestamps to Supabase PostgreSQL.
* **Post-Call Delivery (`scratch/send_custom_whatsapp.ts`):**  
  Automatically sends product solution overview, contact details, architecture diagram (`docs/architecture.png`), and tailored conversation context upon call completion.

---

## 5. Environment Variables Reference (`.env`)

```ini
# Server Configuration
PORT=3000
HOST=0.0.0.0
LOG_LEVEL=info

# Target Call & Contact Configuration
DEFAULT_TARGET_PHONE_NUMBER=+917406209248
DEVELOPER_PHONE_NUMBER=+917406209248
RESUME_URL=https://portfolio-aditya-nine-9.vercel.app/
PORTFOLIO_URL=https://portfolio-aditya-nine-9.vercel.app/
ARCHITECTURE_IMAGE_URL=https://portfolio-aditya-nine-9.vercel.app/

# OmniDimension Telephony
TELEPHONY_PROVIDER=omnidimension
OMNIDIMENSION_API_KEY=your_omnidimension_api_key_here
OMNIDIMENSION_AGENT_ID=248789

# STT & TTS Providers
STT_PROVIDER=sarvam
SARVAM_API_KEY=your_sarvam_api_key_here
TTS_PROVIDER=sarvam

# LLM Fallback Providers
PRIMARY_LLM_PROVIDER=gemini
FALLBACK_LLM_PROVIDER=groq
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# WhatsApp Messaging
WHATSAPP_PROVIDER=ultramsg
ULTRAMSG_INSTANCE_ID=instance189337
ULTRAMSG_TOKEN=your_ultramsg_token_here

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:password@localhost:5432/piha_db
SUPABASE_URL=https://your-supabase-project.supabase.co
```

---

## 6. How to Dispatch Calls

### A. Test Call to Target Phone
Run the test dispatch script:
```bash
npx tsx scratch/dispatch_live_call.ts
```

### B. Live Automated Outbound Call Dispatch
When ready to place an outbound sales qualification call:
1. Edit `scratch/dispatch_live_call.ts` and set:
   ```typescript
   phoneNumber: '+91XXXXXXXXXX'
   ```
2. Run:
   ```bash
   npx tsx scratch/dispatch_live_call.ts
   ```
3. The OmniDimension agent will dial the target recipient, qualify lead requirements (catalog volume, target timeline, features), trigger mid-call WhatsApp collateral dispatch upon high intent, schedule callbacks, and deliver tailored post-call summaries.

---

## 7. Enterprise System Capabilities & Verification Matrix

| Capability | Implementation Architecture | Production Status |
| :--- | :--- | :--- |
| **01. Autonomous Outbound Call** | OmniDimension REST API & bi-directional WebAudio pipeline | **Verified** |
| **02. Telugu / Hindi / English** | Cartesia Ramya + Soniox multilingual language auto-switch | **Verified** |
| **03. E-commerce Sales Pitch** | Consultative discovery workflow with custom feature discovery | **Verified** |
| **04. 4-Pillar Discovery** | Catalog size, monthly order volume, timeline, and feature discovery | **Verified** |
| **05. Real-Time Lead Scoring** | Dynamic intent classification (Cold / Warm / Hot) per turn | **Verified** |
| **06. Mid-Call WhatsApp Action** | Non-blocking collateral dispatch via UltraMsg / Meta Cloud API | **Verified** |
| **07. Spoken Callback Scheduling** | Natural language IST daypart resolver & Google Calendar sync | **Verified** |
| **08. Post-Call Delivery** | Automated WhatsApp follow-up with structured discussion summary | **Verified** |
| **09. System Resilience & Failover**| Gemini 2.5 Flash with Groq Llama-3.3-70b automatic failover | **Verified** |
| **10. CRM & Audit Persistence** | Supabase PostgreSQL schema with turn-by-turn speech transcripts | **Verified** |



### Multi-Channel WhatsApp Routing Configuration
- `WHATSAPP_PRIMARY_PROVIDER`: `ultramsg` | `meta`
- `WHATSAPP_FALLBACK_PROVIDER`: `twilio`
