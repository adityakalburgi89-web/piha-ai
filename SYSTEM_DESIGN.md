# Piha AI — System Design & Architecture Specification (LiveKit Edition)

> **System Version:** 2.5 Enterprise (Microservices & LiveKit Edition)  
> **Target Latency:** < 500ms Full-Duplex Voice Turnaround  
> **Core Architecture:** Real-Time LiveKit SFU + Stateful Voice Agent Workers + LavinMQ AMQP Event Bus + Decoupled Worker Fleet + OpenTelemetry Distributed Tracing

---

## 1. High-Level Design (HLD) Architecture

This bird's-eye view illustrates the clean separation between the **Web Control Plane**, the **Real-Time Media Core (LiveKit)**, the **Voice AI Brain**, and the **Asynchronous Microservices Event Bus**:

```mermaid
flowchart LR
    subgraph Ingress["0. Ingress Channels"]
        WEB["🌐 Web Browser\n(WebRTC Mic/Speaker)"]
        TEL["📱 Mobile Phone\n(PSTN Cellular +91)"]
    end

    subgraph ControlPlane["1. Control Plane (Next.js 15)"]
        GW["API Gateway & Auth\n(Redis Token Bucket)"]
        TOKEN["LiveKit Token Factory\n(JWT Issuer)"]
    end

    subgraph MediaCore["2. Real-Time Media Core"]
        SFU["⚡ LiveKit SFU Server\n(WebRTC Room Audio)"]
        SIP["📞 LiveKit SIP Gateway\n(Twilio / Exotel Bridge)"]
    end

    subgraph VoiceBrain["3. Voice AI Engine (Python)"]
        AGENT["🤖 LiveKit Agent Runner\n(Silero VAD + Sarvam + Gemini)"]
    end

    subgraph EventBus["4. Asynchronous Event Bus"]
        MQ["📨 LavinMQ AMQP Broker\n(piha.events.topic)"]
    end

    subgraph Workers["5. Decoupled Worker Fleet"]
        W_WA["💬 WhatsApp Worker"]
        W_CAL["📅 Calendar Worker"]
        W_POST["📊 Post-Call Analytics"]
    end

    subgraph Storage["6. Persistence & Observability"]
        DB[("💾 Supabase PostgreSQL")]
        OBS["📈 OpenTelemetry & Prometheus"]
    end

    %% Ingress connections
    WEB -->|1. Request Room Token| GW --> TOKEN -->|Signed JWT| WEB
    WEB <-->|2. WebRTC 48kHz Audio Track| SFU
    TEL <-->|PSTN SIP Call| SIP <-->|Bridge to Room| SFU

    %% Audio Plane
    SFU <-->|Bidirectional Audio Stream| AGENT

    %% Async Event Plane
    AGENT -.->|3. Publish Domain Events| MQ
    MQ -->|queue.whatsapp| W_WA
    MQ -->|queue.calendar| W_CAL
    MQ -->|queue.postcall| W_POST

    %% Data & Telemetry
    W_POST --> DB
    AGENT & W_WA & W_POST -.-> OBS
```

---

## 2. Real-Time Audio Data Plane (Voice Flow Diagram)

This diagram details every millisecond of the speech pipeline from audio ingress to VAD, streaming transcription, LLM reasoning, chunked TTS synthesis, and barge-in:

```mermaid
flowchart TD
    A["Caller Speaks: 20ms Audio Frame Ingress"] --> B{"Silero VAD: Voice Detected?"}
    B -- "No (Silence)" --> C["Keep Jitter Buffer Clear"]
    B -- "Yes (Speech Conf > 0.75)" --> D["Stream Audio Frames to Sarvam AI ASR"]
    
    D --> E["Sarvam AI saaras:v3: Partial & Final Transcripts\n(Kannada / Hindi / Telugu / English)"]
    E --> F["Agent Turn Router: Assemble Prompt Context & History"]
    
    F --> G{"Primary LLM: Gemini 2.5 Flash"}
    G -- "Latency < 10s & 200 OK" --> H["Stream Output Tokens (~180ms TTFB)"]
    G -- "Timeout >= 10s or 429 Rate Limit" --> I["Circuit Breaker: Groq Llama 3.3 70B"]
    I --> H
    
    H --> J{"Language Router: Indic or English?"}
    J -- "Kannada / Hindi / Telugu" --> K["Sarvam AI TTS: Ishita / Arvind\n(Authentic Indian Prosody)"]
    J -- "English" --> L["Cartesia Sonic TTS\n(< 100ms Ultra-Fast TTFB)"]
    
    K & L --> M["Group Tokens into 4-Word Clauses -> Audio Frames"]
    M --> N["Publish Synthesized Audio to LiveKit Audio Track"]
    N --> O["Audio Plays in Caller Ear (< 500ms Total Turnaround)"]

    subgraph Interruption["Instant Barge-In Protection (< 40ms)"]
        P["Caller Interrupts Mid-Sentence"] --> Q["Silero VAD Conf > 0.8 for 150ms"]
        Q --> R["Cancel LLM Generator & Abort TTS Stream"]
        R --> S["Flush LiveKit Egress Audio Track Buffer"]
        S --> T["Bot Instantly Goes Silent in Caller's Ear"]
    end
```

---

## 3. Asynchronous Microservices & Event Routing Flow

How non-voice side effects (WhatsApp brochures, calendar bookings, and database writes) run asynchronously without introducing audio jitter:

```mermaid
flowchart LR
    subgraph Publisher["Voice Agent Process"]
        Agent["LiveKit Agent Process"] -->|Non-blocking setImmediate| Pub["AMQP Publisher"]
    end

    subgraph Broker["LavinMQ AMQP 0-9-1"]
        Pub --> Ex["piha.events.topic\n(Durable Topic Exchange)"]
        Ex -->|action.whatsapp.*| Q1[("queue.whatsapp")]
        Ex -->|action.calendar.*| Q2[("queue.calendar")]
        Ex -->|call.completed| Q3[("queue.postcall")]
    end

    subgraph Consumers["Worker Microservices"]
        Q1 --> W1["service-notification\n(WhatsApp Worker)"]
        Q2 --> W2["service-calendar\n(Booking Worker)"]
        Q3 --> W3["service-analytics\n(Post-Call Fact Extractor)"]
    end

    subgraph Destinations["External APIs & Storage"]
        W1 -->|WhatsApp Cloud API| Out1["Customer Phone\n(PDF Catalog Delivered < 1.2s)"]
        W2 -->|Google Calendar API| Out2["Google Meet Invite\n(Calendar Slot Confirmed)"]
        W3 -->|PostgreSQL ACID Write| Out3[("Supabase PostgreSQL\n(Full Call History & Metrics)")]
    end

    subgraph DLQ["Dead Letter Resilience"]
        W1 -.->|5 Failed Retries| DLEx["piha.dlx.exchange"]
        DLEx --> DLQueue[("Dead Letter Queue\n(Alerts Ops if Depth > 5)")]
    end
```

---

## 4. Live Conversational Turn Sequence (Timeline)

```mermaid
sequenceDiagram
    autonumber
    actor Caller as Customer (Phone / Web)
    participant SFU as service-media (LiveKit SFU)
    participant Agent as service-agent-fleet (Python Worker)
    participant VAD as Silero VAD (Local CPU)
    participant STT as Sarvam AI Streaming ASR
    participant LLM as Gemini 2.5 Flash / Groq
    participant TTS as Sarvam AI TTS / Cartesia
    participant Broker as LavinMQ (AMQP Bus)
    participant WA as service-notification (WhatsApp Worker)
    participant DB as service-analytics (PostgreSQL)

    Caller->>SFU: User speaks ("ನಮಸ್ಕಾರ, ನನಗೆ ಡೆಮೊ ಬೇಕು")
    SFU->>VAD: Audio frames (20ms chunks)
    VAD->>STT: Human speech detected -> Stream PCM frames
    STT-->>Agent: Final Text: "ನಮಸ್ಕಾರ, ನನಗೆ ಡೆಮೊ ಬೇಕು"
    
    par Real-Time AI Turn Reasoning (Tight Loop)
        Agent->>LLM: Prompt Context + Language: Kannada
        LLM-->>Agent: Stream token chunks ("ಖಂಡಿತ, ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ...")
    and Asynchronous AMQP Event Hand-off (Zero Audio Blocking)
        Agent->>Broker: Publish 'action.whatsapp.brochure' (Trace ID injected)
    end

    par Streaming Audio Synthesis (To Ear)
        Agent->>TTS: Stream token chunk 1 ("ಖಂಡಿತ,")
        TTS-->>SFU: First synthesized audio packet (< 140ms TTFB)
        SFU-->>Caller: Plays native Kannada voice in user's ear
    and Asynchronous Worker Consumption
        Broker->>WA: Deliver message from 'queue.whatsapp'
        WA->>Caller: WhatsApp brochure arrives on phone (< 1.2s)
    end

    opt Instant Barge-In (Interruption Triggered)
        Caller->>SFU: User interrupts mid-sentence ("Wait, stop!")
        SFU->>VAD: Analyze incoming frames
        VAD-->>Agent: Human speech detected (Confidence > 0.8)
        Agent->>SFU: Flush outgoing audio track immediately (< 40ms)
        Agent->>TTS: Abort in-flight synthesis
        SFU-->>Caller: Audio cuts off instantly (Zero talking over caller)
    end

    Note over SFU,Caller: When call finishes...
    Agent->>Broker: Publish 'call.completed' (Audio S3 URL + Full Transcript)
    Broker->>DB: Deliver to service-analytics
    DB->>DB: Fact extraction, sentiment scoring & ACID write to PostgreSQL
```

---

## 5. Circuit Breaker & Resilience State Machine

```mermaid
stateDiagram-v2
    [*] --> Closed: Normal Operation

    state Closed {
        [*] --> CallGemini: Query Gemini 2.5 Flash
        CallGemini --> Success: Response in < 10s
        Success --> [*]
    }

    Closed --> HalfOpen: Latency > 10s or 429 Rate Limit
    
    state HalfOpen {
        [*] --> CallGroq: Failover to Groq Llama 3.3 70B
        CallGroq --> GroqSuccess: Fast Response (< 1.2s)
        GroqSuccess --> Closed: Reset Error Counter
        CallGroq --> BothFail: Groq also times out
    }

    HalfOpen --> Open: Both LLMs Down
    
    state Open {
        [*] --> FailClosedAction: Trigger Fail-Closed Safety Gate
        FailClosedAction --> SpeakApology: "Technical delay; calling back shortly"
        SpeakApology --> QueueUrgentCallback: Push urgent lead to LavinMQ
        QueueUrgentCallback --> TerminateCall: Clean Hangup via LiveKit Room Disconnect
    }
```

---

## 6. Multi-Container Docker Compose Topology

```yaml
version: "3.9"

services:
  # Microservice 1: Next.js API Gateway & Dashboard
  service-gateway:
    build:
      context: .
      dockerfile: Dockerfile.gateway
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/piha_db
      - REDIS_URL=redis://redis:6379
      - LIVEKIT_URL=ws://service-media:7880
      - LIVEKIT_API_KEY=devkey
      - LIVEKIT_API_SECRET=secretkey
    networks:
      - frontend-net
      - backend-net
    depends_on:
      - redis
      - postgres

  # Microservice 2: LiveKit SFU Media Server
  service-media:
    image: livekit/livekit-server:v1.7
    command: --config /etc/livekit.yaml
    ports:
      - "7880:7880"
      - "7881:7881"
      - "50000-50050:50000-50050/udp"
    networks:
      - frontend-net
      - media-net

  # Microservice 3: Python Voice Agent Runner Fleet
  service-agent-fleet:
    build:
      context: ./agent
      dockerfile: Dockerfile.agent
    environment:
      - LIVEKIT_URL=ws://service-media:7880
      - LIVEKIT_API_KEY=devkey
      - LIVEKIT_API_SECRET=secretkey
      - SARVAM_API_KEY=${SARVAM_API_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - GROQ_API_KEY=${GROQ_API_KEY}
      - AMQP_URL=amqp://guest:guest@lavinmq:5672/
    deploy:
      replicas: 2
    networks:
      - media-net
      - backend-net
    depends_on:
      - service-media
      - lavinmq

  # Microservice 4: WhatsApp Notification Worker
  service-notification:
    build:
      context: ./workers/notification
    environment:
      - AMQP_URL=amqp://guest:guest@lavinmq:5672/
      - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
      - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
    networks:
      - backend-net
    depends_on:
      - lavinmq

  # Microservice 5: Calendar Booking Worker
  service-calendar:
    build:
      context: ./workers/calendar
    environment:
      - AMQP_URL=amqp://guest:guest@lavinmq:5672/
      - GOOGLE_CALENDAR_CLIENT_ID=${GOOGLE_CALENDAR_CLIENT_ID}
    networks:
      - backend-net
    depends_on:
      - lavinmq

  # Microservice 6: Post-Call Analytics & PostgreSQL Writer
  service-analytics:
    build:
      context: ./workers/analytics
    environment:
      - AMQP_URL=amqp://guest:guest@lavinmq:5672/
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/piha_db
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    networks:
      - backend-net
    depends_on:
      - lavinmq
      - postgres

  # Infrastructure: LavinMQ AMQP Message Broker
  lavinmq:
    image: cloudamqp/lavinmq:latest
    ports:
      - "5672:5672"
      - "15672:15672"
    networks:
      - backend-net

  # Infrastructure: Redis Cache
  redis:
    image: redis:7-alpine
    networks:
      - backend-net

  # Infrastructure: PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=piha_db
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - backend-net

networks:
  frontend-net:
  media-net:
  backend-net:

volumes:
  pgdata:
```

---

## 7. Subsystem Specifications & Performance SLAs

| Microservice | Technology Stack | Transport / Protocol | Concurrency / SLA Target | Primary Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| **`service-gateway`** | Next.js 15, TypeScript | HTTPS / REST | `< 15ms` Response | Auth, rate limiting (Redis token bucket), LiveKit JWT generation |
| **`service-media`** | LiveKit SFU (Go) | WebRTC / SIP UDP | `< 30ms` Transport | WebRTC room management, jitter smoothing, telephone SIP bridging |
| **`service-agent-fleet`** | Python (`livekit-agents`) | Real-time WebRTC Track | `< 500ms` Total Turn | Silero VAD, Sarvam ASR, Gemini LLM, Sarvam/Cartesia TTS chunking |
| **`lavinmq`** | LavinMQ (Crystal) | AMQP 0-9-1 | `> 500,000` msgs/sec | Decouples external vendor side effects from real-time audio |
| **`service-notification`** | Node.js / Go Worker | AMQP Consumer | `< 1.2s` Delivery | Consumes `queue.whatsapp`, dispatches mid-call brochures, manages retries |
| **`service-calendar`** | Node.js Worker | AMQP Consumer | `< 800ms` Processing | Consumes `queue.calendar`, binds natural language slots to IST dates |
| **`service-analytics`** | Python Worker | AMQP Consumer | Non-blocking Async | Consumes `queue.postcall`, extracts facts, archives audio, writes to PostgreSQL |
| **`database`** | PostgreSQL 16 (Supabase) | Pooled TCP | Zero audio impact | ACID persistence of calls, transcripts, audio recordings, and leads |

---

## 8. The 10 Hardened Production Edge Cases

| # | Edge Case / Failure Mode | Root Cause | Exact Microservice Mitigation |
| :--- | :--- | :--- | :--- |
| **1** | **Self-Barge-In Echo** | Speakerphone audio bounces into mic | LiveKit egress track suppression + WebRTC Acoustic Echo Cancellation (AEC) |
| **2** | **Zombie Ghost Rooms** | Caller drops 4G cell signal mid-call | `empty_timeout: 10s` in `service-media` auto-cleans abandoned rooms |
| **3** | **Sample Rate Distortion** | 8kHz phone audio vs 16kHz model | LiveKit automatic audio stream resampler standardizes to 16kHz linear PCM |
| **4** | **"Hmm/Haan" False Cut-off**| Monosyllabic caller acknowledgment | `min_speech_duration: 0.3s` in Silero VAD treats brief murmurs as backchannels |
| **5** | **Missing Punctuation Lag** | Indian ASR omitting periods | Hybrid chunker sends audio to TTS every 5 words if no punctuation appears |
| **6** | **Kanglish / Hinglish** | Code-mixed regional language speech | Sarvam `saaras:v3` code-mixed mode + Gemini mirror-matching prompt rule |
| **7** | **LLM Primary Outage (429)** | Gemini Flash latency > 10s | Circuit breaker trips within 200ms to Groq Llama 3.3 70B with synced context |
| **8** | **Both LLMs Down** | Total provider failure | Fail-closed gate speaks polite apology and enqueues urgent callback in LavinMQ |
| **9** | **Duplicate WhatsApp Send** | Caller asks for brochure multiple times | In-memory session idempotency lock prevents duplicate AMQP publish |
| **10**| **Database Downtime** | PostgreSQL connection pool saturation | Calls operate 100% in-memory; events buffer safely in LavinMQ durable queues |

---

## 9. OpenTelemetry Distributed Tracing & Observability

### 9.1 Distributed Tracing Waterfall (Target: < 650ms Total Turnaround)

```mermaid
gantt
    title LiveKit Voice Turn Trace Waterfall (Target: < 650ms)
    dateFormat X
    axisFormat %s ms

    section LiveKit Ingress
    WebRTC / SIP Packet Ingress   : 0, 30
    Silero VAD Speech Detection   : 25, 60

    section Multilingual ASR
    Sarvam AI Streaming ASR       : 60, 240

    section Cognitive Reasoning
    Agent Prompt & Context Assembly: 240, 260
    Gemini 2.5 Flash First Token  : 260, 440

    section Streaming Synthesis
    Sarvam AI / Cartesia First TTS: 440, 570
    LiveKit Audio Track Egress    : 570, 640

    section Async Telemetry
    LavinMQ Event Publish         : 440, 455
    OpenTelemetry Span Export     : 640, 660
```

### 9.2 Zero-Allocation Structured JSON Logging

```json
{
  "level": "info",
  "time": 1790008620000,
  "service": "piha-agent-runner",
  "room_name": "room_call_917406209248",
  "participant_identity": "user_mobile_phone",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "turn_index": 2,
  "language_detected": "kn-IN",
  "event": "voice_turn_completed",
  "metrics": {
    "vad_latency_ms": 35,
    "asr_latency_ms": 180,
    "llm_ttfb_ms": 185,
    "tts_ttfb_ms": 130,
    "total_turnaround_ms": 530
  },
  "circuit_breaker": "CLOSED",
  "barge_in_triggered": false,
  "msg": "Turn 2 turnaround completed in 530ms"
}
```

### 9.3 Prometheus Alerting Rules

```yaml
groups:
  - name: piha_voice_alerts
    rules:
      - alert: TurnaroundLatencyExceeded
        expr: histogram_quantile(0.95, rate(livekit_voice_turn_latency_ms_bucket[2m])) > 900
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Voice Turn Latency p95 exceeded 900ms SLA"

      - alert: LLMFailoverTriggered
        expr: circuit_breaker_state{service="primary_llm"} == 2
        for: 30s
        labels:
          severity: warning
        annotations:
          summary: "Gemini Flash circuit breaker tripped; traffic failed over to Groq Llama 3.3"

      - alert: LavinMQDeadLetterAccumulation
        expr: lavinmq_queue_depth{queue="dlq"} > 5
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "LavinMQ DLQ has accumulated > 5 failed side-effect messages"
```
