# OmniDimension Telephony Protocol

- Outbound Dialing Method: REST POST /v1/calls
- Audio Transport: WebSocket bi-directional PCM16 stream
- Webhook Events: `call.initiated`, `call.ringing`, `call.answered`, `call.hangup`
- Barge-in Delay: < 80ms latency from speech energy trigger
