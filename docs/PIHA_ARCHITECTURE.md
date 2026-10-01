# Piha AI — Sub-Second Telephony Architecture

```
[Caller Phone] <---> [OmniDimension / Twilio SIP Gateway]
                               |
                    [Piha Fastify Turn Loop]
                               |
    +--------------------------+--------------------------+
    |                          |                          |
[Sarvam STT Saarika]   [Gemini Flash / Groq LLM]   [Sarvam TTS Bulbul]
                               |
                   [WhatsApp Mid-Call Dispatch]
```

## Performance Benchmarks
- STT Turn Processing: ~210ms
- LLM Turn Reasoner: ~420ms
- TTS Audio Generation: ~180ms
- Total End-to-End Latency: **~810ms**

---

> **Full Enterprise Visual System Design:**  
> For the complete 7-layer architecture, LavinMQ AMQP decoupling, dual-LLM circuit breaker, and sequence diagrams, refer to [DESIGN.md](file:///c:/Users/adity/OneDrive/Desktop/elavateVoice/DESIGN.md).
