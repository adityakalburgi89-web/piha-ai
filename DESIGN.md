# Piha AI — System Design & Architecture Specification

> **System Version:** 2.0 Enterprise  
> **Target Latency:** < 400ms Full-Duplex Voice Turnaround  
> **Core Architecture:** Real-Time WebSocket Audio Streaming + Dual-LLM Circuit Breaker + LavinMQ AMQP Event Broker + OpenTelemetry Observability

---

## 1. Visual End-to-End System Architecture

```mermaid
flowchart TB
    %% Ingress & Edge
    subgraph INGRESS["1. Ingress & Telephony Edge Layer"]
        CALLER["Customer Mobile Phone\n(PSTN / Telephony Voice)"]
        WEB_USER["Next.js Web Client\n(Audio Orb / Dialer / Dashboard)"]
        RATE_LIMIT["Rate Limiter Cluster\n(Redis Token Bucket [Fast Path])"]
        API_GATEWAY["API Gateway & Reverse Proxy\n(Next.js App Router / Fastify)"]
    end

    %% Real-time Voice Plane
    subgraph VOICE_STREAM["2. Real-Time Audio Data Plane (WebSockets)"]
        CARRIER["Telephony Carrier\n(OmniDimension / Twilio SIP Trunk)"]
        WSS_SERVER["Piha Fastify Turn Server\n(Bi-Directional 16kHz PCM WSS)"]
        VAD["VAD & Barge-In Detector\n(< 50ms Audio Buffer Flush)"]
        STT["Multilingual Streaming STT\n(Sarvam AI Saarika v2.5 / Soniox)"]
        TTS["Streaming TTS Audio Synthesizer\n(Cartesia Sonic / Sarvam Bulbul)"]
    end

    %% AI Cognitive Core
    subgraph COGNITIVE["3. AI Intelligence & Resilience Engine"]
        TURN_ROUTER["Piha AI Orchestrator\n(Turn History & Prompt Context Engine)"]
        CIRCUIT_BREAKER{"Circuit Breaker\n(Timeout >= 12s or 429?)"}
        GEMINI["Primary LLM\n(Gemini 2.5 Flash — ~180ms TTFB)"]
        GROQ["Fallback LLM\n(Groq Llama 3.3 70B — ~220ms TTFB)"]
        FAIL_CLOSED["Fail-Closed Safety Gate\n(Polite Hangup & Urgent Callback)\n[No Hallucinated Pricing]"]
    end

    %% Business Logic
    subgraph BIZ_LOGIC["4. Business Rules & Guardrails Core"]
        STATE_STORE["In-Memory Call Session Store\n(Canonical State Machine)"]
        LEAD_ENG["Lead Qualification Engine\n(Intent Scoring: HOT / WARM / COLD)"]
        GUARDRAILS["Action Guardrails\n(Single-Dispatch Idempotency Lock)"]
        DT_RESOLV["IST DateTime Resolver\n(Natural Language Slot Parser)"]
    end

    %% LavinMQ Message Broker
    subgraph MESSAGE_BUS["5. High-Throughput Message Broker (LavinMQ AMQP)"]
        PRODUCER["AMQP Producer Client\n(Non-Blocking setImmediate Publisher)"]
        EXCHANGE["piha.events.topic\n(Durable Topic Exchange)"]
        
        Q_WA[("queue.whatsapp\n[Persistent Queue]")]
        Q_CAL[("queue.calendar\n[Persistent Queue]")]
        Q_CRM[("queue.crm\n[Persistent Queue]")]
        Q_SUM[("queue.postcall\n[Persistent Queue]")]
        DLX[("piha.dlx.exchange\n[Dead Letter Queue]")]
    end

    %% Worker Fleet
    subgraph WORKERS["6. Decoupled Worker Fleet (Async Consumers)"]
        W_WA["WhatsApp Dispatcher Worker\n(UltraMsg / Twilio / Meta API)"]
        W_CAL["Calendar Scheduler Worker\n(Google Calendar API)"]
        W_CRM["CRM Sync Worker\n(HubSpot / Custom Webhooks)"]
        W_SUM["Post-Call Synthesis Worker\n(LLM Fact Extraction & Audio Archive)"]
    end

    %% Storage & Observability
    subgraph DATA_OBS["7. Storage, Ledger & Observability"]
        POSTGRES[("Supabase PostgreSQL\n(ACID Call Ledger & Transcripts)")]
        OTEL["OpenTelemetry Collector\n(Distributed Spans, Traces & Logs)"]
        PROM["Prometheus Metrics Server\n(Voice TTFB, Jitter, Packet Drop)"]
        GRAFANA["Grafana & Kibana Dashboards\n(Real-Time Analytics & Call Playback)"]
    end

    %% Connections - Audio & Ingress
    CALLER <-->|PSTN SIP Call| CARRIER
    CARRIER <-->|Bidirectional WSS PCM Stream| WSS_SERVER
    WEB_USER --> RATE_LIMIT --> API_GATEWAY --> WSS_SERVER

    %% Connections - Speech Processing
    WSS_SERVER --> VAD --> STT
    STT -->|Live Utterance Chunk| TURN_ROUTER
    TURN_ROUTER --> TTS
    TTS -->|Streaming PCM Audio Chunks| WSS_SERVER

    %% Connections - AI Engine
    TURN_ROUTER <--> STATE_STORE
    TURN_ROUTER --> CIRCUIT_BREAKER
    CIRCUIT_BREAKER -->|Primary Route| GEMINI
    CIRCUIT_BREAKER -.->|Timeout or Rate Limit| GROQ
    CIRCUIT_BREAKER -.->|Both Providers Fail| FAIL_CLOSED
    GEMINI & GROQ --> TURN_ROUTER

    %% Connections - Rules & Event Publishing
    TURN_ROUTER --> LEAD_ENG & GUARDRAILS & DT_RESOLV
    GUARDRAILS & DT_RESOLV --> PRODUCER
    PRODUCER --> EXCHANGE

    %% Connections - LavinMQ Routing
    EXCHANGE --> Q_WA & Q_CAL & Q_CRM & Q_SUMMARY
    Q_WA -.->|Max Retries Exceeded| DLX

    %% Connections - Workers
    Q_WA --> W_WA
    Q_CAL --> W_CAL
    Q_CRM --> W_CRM
    Q_SUM --> W_SUM

    %% Connections - External Actions
    W_WA -.->|Mid-Call Catalog Brochure PDF| CALLER
    W_CAL -.->|Google Calendar Invite| CALLER

    %% Connections - Persistence & Telemetry
    W_SUM & W_CRM --> POSTGRES
    API_GATEWAY <--> POSTGRES
    WSS_SERVER & TURN_ROUTER & PRODUCER --> OTEL
    OTEL --> PROM --> GRAFANA
```

---

## 2. Real-Time Conversational Turn Sequence

This sequence demonstrates a live caller interaction where speech is transcribed, reasoned over by the LLM, synthesised into voice, and a mid-call WhatsApp message is safely dispatched via LavinMQ without interrupting the audio loop:

```mermaid
sequenceDiagram
    autonumber
    actor Caller as Customer (Phone)
    participant Carrier as OmniDimension / SIP
    participant Gateway as Voice Gateway (Fastify)
    participant STT as Sarvam Saarika STT
    participant Orch as Piha AI Orchestrator
    participant LLM as Gemini 2.5 Flash / Groq
    participant Lavin as LavinMQ (AMQP Broker)
    participant Worker as WhatsApp Worker
    participant TTS as Cartesia Sonic TTS

    Caller->>Carrier: "I need an e-commerce website for 100 products"
    Carrier->>Gateway: WebSocket 16kHz PCM Stream
    Gateway->>STT: Stream Audio Buffer
    STT-->>Gateway: Partial/Final Text: "100 products e-commerce..."
    Gateway->>Orch: Ingest Turn & Update Session Machine

    par Non-blocking AI Inference
        Orch->>LLM: Prompt Context + Intent Scoring Request
        LLM-->>Orch: JSON: Spoken Text + Lead: HOT
    and Idempotent Event Hand-off
        Orch->>Lavin: Publish to 'piha.events.topic' (Routing: action.whatsapp.dispatch)
    end

    par Real-Time Speech Synthesis
        Orch->>TTS: Stream Spoken Text ("I'll WhatsApp our catalog right now...")
        TTS->>Gateway: PCM Audio Chunks (< 120ms TTFB)
        Gateway->>Carrier: WebSocket Audio Playback
        Carrier-->>Caller: Speaks in caller's ear in real-time
    and Asynchronous External Execution
        Lavin->>Worker: Deliver event from 'queue.whatsapp'
        Worker->>Caller: WhatsApp Message Arrives on Phone (< 1.2s)
    end
```

---

## 3. Circuit Breaker & Resilience State Machine

```mermaid
stateDiagram-v2
    [*] --> Closed: Normal Operation

    state Closed {
        [*] --> CallGemini: Query Gemini 2.5 Flash
        CallGemini --> Success: Response in < 12s
        Success --> [*]
    }

    Closed --> HalfOpen: Latency > 12s or 429 Rate Limit
    
    state HalfOpen {
        [*] --> CallGroq: Failover to Groq Llama 3.3 70B
        CallGroq --> GroqSuccess: Fast Response (< 1.5s)
        GroqSuccess --> Closed: Reset Error Counter
        CallGroq --> BothFail: Groq also times out
    }

    HalfOpen --> Open: Both LLMs Down
    
    state Open {
        [*] --> FailClosedAction: Trigger Fail-Closed Safety Gate
        FailClosedAction --> SpeakApology: "Technical delay; calling back shortly"
        SpeakApology --> QueueUrgentCallback: Push urgent lead to LavinMQ
        QueueUrgentCallback --> TerminateCall: Clean Hangup
    }
```

---

## 4. ASCII Architecture Blueprint

```
                      +------------------------------------------+
                      |         PSTN / Mobile Telephone          |
                      +------------------------------------------+
                                           |
                                  SIP Trunk / WSS PCM
                                           v
                      +------------------------------------------+
                      |      OmniDimension / Twilio Gateway      |
                      +------------------------------------------+
                                           |
                               WebSocket Audio Frames
                                           v
+-----------------------------------------------------------------------------------+
|                         PIHA FASTIFY VOICE GATEWAY                                |
|                                                                                   |
|  +---------------------+   +---------------------+   +-------------------------+  |
|  |   VAD & Barge-In    |-->|  Sarvam Saarika STT |-->|     AI ORCHESTRATOR     |  |
|  | (<50ms audio flush) |   | (Multilingual code) |   | (Turn context & router) |  |
|  +---------------------+   +---------------------+   +-------------------------+  |
|                                                                   |               |
|                                                      +------------+------------+  |
|                                                      v                         v  |
|                                              +---------------+         +---------------+
|                                              |  Gemini Flash |         |  Groq Llama   |
|                                              | (Primary LLM) |<-[CB]-->| (Fallback LLM)|
|                                              +---------------+         +---------------+
|                                                      |                         |  |
|                                                      +------------+------------+  |
|                                                                   v               |
|  +---------------------+                             +-------------------------+  |
|  | Cartesia Sonic TTS  |<----------------------------|     BUSINESS LOGIC      |  |
|  | (<120ms Audio TTFB) |                             | (Lead Scoring & Locks)  |  |
|  +---------------------+                             +-------------------------+  |
|            |                                                      |               |
+------------|------------------------------------------------------|---------------+
             |                                                      |
             |                                                      |--[Async OTLP Spans & Pino Logs]-->+--------------------------------+
             |                                                      |                                   |   OBSERVABILITY PIPELINE       |
             |                                                      |                                   |  - OpenTelemetry Collector     |
             |                                                      |                                   |  - Prometheus (TTFB / Latency) |
             |                                                      |                                   |  - Grafana Loki (JSON Logs)    |
      Audio Return                                          Publish AMQP Event                          |  - Tempo/Jaeger (Flamegraphs)  |
             v                                                      v                                   +--------------------------------+
     [Caller Speaks]                                   +-------------------------+
                                                       |   LAVINMQ AMQP BROKER   |
                                                       +-------------------------+
                                                                    |
                                        +-------------------+-------+-------------------+
                                        |                   |                           |
                                        v                   v                           v
                              +------------------+ +------------------+       +------------------+
                              | queue.whatsapp   | |  queue.calendar  |       | queue.postcall   |
                              +------------------+ +------------------+       +------------------+
                                        |                   |                           |
                                        v                   v                           v
                              +------------------+ +------------------+       +------------------+
                              | WhatsApp Worker  | | Calendar Worker  |       | Synthesis Worker |
                              | (UltraMsg/Twilio)| | (Google Cal API) |       |  (Fact Extractor)|
                              +------------------+ +------------------+       +------------------+
                                        |                   |                           |
                                        +-------------------+---------------------------+
                                                            |
                                                   Post-Call ACID Write
                                                            v
                                               +-------------------------+
                                               |  Supabase / PostgreSQL  |
                                               +-------------------------+
```

---

## 5. Subsystem Specifications & SLAs

| Subsystem | Technology | Protocol | SLA / Performance Target | Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| **Edge Ingress** | Next.js / Fastify | HTTPS & WSS | `< 10ms` Handshake | Rate limiting (Redis Token Bucket) & SIP session initialization |
| **Voice Streaming** | Node.js Fastify | Bi-directional WSS | `< 50ms` Barge-in | PCM audio framing, jitter buffer, and immediate VAD speech interruption |
| **Speech-to-Text** | Sarvam Saarika v2.5 | Streaming WebSocket | `< 200ms` Turnaround | Multilingual ASR (English, Hindi, Telugu, Hinglish, Telugish) |
| **Speech Synthesis** | Cartesia Sonic / Bulbul | Streaming PCM | `< 120ms` TTFB | Ultra-fast human-like voice synthesis directly to WebSocket stream |
| **AI Intelligence** | Gemini 2.5 Flash | REST / Stream JSON | `< 250ms` Generation | Context assembly, intent diagnosis, and turn-taking reasoning |
| **Failover Intelligence** | Groq Llama 3.3 70B | REST JSON | `< 300ms` Generation | Active circuit breaker fallback if Gemini exceeds 12s timeout |
| **Message Broker** | LavinMQ | AMQP 0-9-1 | `> 500,000` msgs/sec | Decouples external network I/O from real-time audio loop |
| **Storage & Ledger** | Supabase PostgreSQL | SSL Pooled TCP | Zero audio impact | ACID persistence of calls, transcripts, and scheduled slots |
| **Observability** | OpenTelemetry + Prometheus | OTLP / gRPC | Real-time | Continuous monitoring of voice latency, jitter, and error budgets |

---

## 6. Verification & Hardening Scenarios

The architecture is hardened against 8 mission-critical failure modes:
1. **Barge-In Interrupt:** When customer speaks while AI speaks, audio buffer flushes in $<50$ms and TTS stream aborts immediately.
2. **Gemini Outage / 429:** Circuit breaker engages Groq Llama 3.3 70B within 12s, keeping conversation seamless.
3. **Double Failure (Both LLMs Down):** System fails closed with a polite apology and queues an immediate callback in LavinMQ.
4. **WhatsApp API Downtime:** LavinMQ retries with exponential backoff ($1\text{s} \rightarrow 2\text{s} \rightarrow 4\text{s}$), dead-lettering after 5 attempts without blocking the live call.
5. **Idempotency Guard:** WhatsApp brochures can only be dispatched once per call session, regardless of how many times a user mentions "send it".
6. **Ambiguous Date Parsing:** The IST DateTime Resolver strictly binds relative terms ("tomorrow afternoon") to Indian Standard Time (+05:30).
7. **Database Outage:** Voice conversation operates purely in-memory; DB persistence is buffered in LavinMQ and drained once PostgreSQL recovers.
8. **Rate Limiting:** Web dialer attacks are mitigated at the edge by the Redis Token Bucket before touching telephony SIP channels.

---

## 7. Observability, Structured Logging & Live Monitoring Architecture

To ensure sub-second reliability and zero blind spots during live voice calls, the system implements a **Three-Pillar Observability Architecture** (Logs, Metrics, and Distributed Tracing) operating out-of-band without blocking audio packets.

### 7.1 Distributed Tracing (OpenTelemetry Span Waterfall)

Every phone call carries a unique `trace_id` propagated across WebSocket frames, LLM turns, and AMQP background jobs:

```mermaid
gantt
    title Sub-Second Voice Turn Trace Waterfall (Target: < 750ms)
    dateFormat X
    axisFormat %s ms

    section Audio Ingestion
    RTP/PCM Ingress & Jitter Buffer : 0, 45
    VAD Speech Detection            : 40, 75

    section Speech-to-Text
    Sarvam Saarika Streaming STT    : 75, 260

    section LLM Cognitive Turn
    Turn Router & History Assembly : 260, 290
    Gemini 2.5 Flash Streaming TTFB : 290, 470

    section Audio Synthesis
    Cartesia Sonic First Chunk TTS : 470, 590
    PCM Egress Stream to Caller    : 590, 720

    section Async Telemetry & Side Effects
    LavinMQ Event Publish          : 470, 485
    Pino Structured Log Flush      : 720, 730
    OpenTelemetry Span Export      : 720, 740
```

### 7.2 High-Throughput Structured Logging (Zero-Allocation Pino)

All log lines are emitted as single-line JSON with standardized telemetry metadata:

```json
{
  "level": "info",
  "time": 1790008620000,
  "service": "piha-voice-gateway",
  "call_id": "omn_1790008618289",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "span_id": "00f067aa0ba902b7",
  "agent_id": "agent-real-estate-bangalore-luxury-pen-mubgwumm",
  "turn_index": 3,
  "event": "turn_completed",
  "metrics": {
    "vad_latency_ms": 32,
    "stt_latency_ms": 185,
    "llm_ttfb_ms": 180,
    "tts_ttfb_ms": 115,
    "total_turnaround_ms": 512,
    "tokens_prompt": 412,
    "tokens_completion": 34
  },
  "circuit_breaker": "CLOSED",
  "barge_in_occurred": false,
  "msg": "Voice turn 3 turnaround completed in 512ms"
}
```

### 7.3 Real-Time Prometheus Metrics

| Metric Name | Type | Labels | Description / SLA Threshold |
| :--- | :--- | :--- | :--- |
| `voice_turn_latency_ms` | Histogram | `agent_id`, `provider`, `status` | Full turn turnaround (p50 < 600ms, p95 < 900ms, p99 < 1200ms) |
| `voice_barge_in_total` | Counter | `agent_id`, `interruption_turn` | Count of times user interrupted AI during speech |
| `llm_time_to_first_byte_ms` | Histogram | `model` (`gemini`, `groq`) | Time taken for LLM to yield the first response token |
| `circuit_breaker_state` | Gauge | `service` (`primary_llm`) | 0 = Closed (Normal), 1 = Half-Open, 2 = Open (Tripped) |
| `lavinmq_queue_depth` | Gauge | `queue` (`whatsapp`, `calendar`, `dlq`) | Count of pending asynchronous jobs (Alert if DLQ > 5) |
| `audio_packet_loss_ratio` | Gauge | `call_id`, `direction` | Jitter and dropped PCM frames (Alert if > 3%) |

### 7.4 Live Alerting & Incident Escalation Rules

```yaml
groups:
  - name: voice_ai_critical_alerts
    rules:
      - alert: TurnaroundLatencyDegraded
        expr: histogram_quantile(0.95, rate(voice_turn_latency_ms_bucket[2m])) > 1200
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Voice Turn Latency p95 exceeded 1200ms SLA"

      - alert: LLMCircuitBreakerTripped
        expr: circuit_breaker_state{service="primary_llm"} == 2
        for: 30s
        labels:
          severity: warning
        annotations:
          summary: "Gemini Flash circuit breaker tripped; traffic failed over to Groq Llama 3.3"

      - alert: DeadLetterQueueAccumulation
        expr: lavinmq_queue_depth{queue="dlq"} > 5
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "LavinMQ DLQ has accumulated > 5 failed side-effect messages"
```
