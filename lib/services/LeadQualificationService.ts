import { CallState, QualificationDecision, qualificationDecisionSchema } from '../core/types/callState';
import { env } from '../config/env';

export class LeadQualificationService {
  private apiKey: string;
  private primaryModel = 'gemini-2.5-flash';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || env.GEMINI_API_KEY || '';
  }

  async evaluateLead(callState: CallState, latestSpeech: string): Promise<QualificationDecision> {
    const defaultDecision: QualificationDecision = this.heuristicFallback(callState, latestSpeech);

    if (!this.apiKey) {
      return defaultDecision;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const prompt = `You are an expert sales analyst evaluating a live phone call lead for ElevateBox (e-commerce website development).

CLASSIFICATION CRITERIA:
1. "HOT" (High buying intent, ready to purchase):
   - Asking specific start date/timeline ("how soon can you start", "live next week")
   - Asking specific commercial terms ("what is the payment schedule", "send me contract/invoice")
   - Action: "send_mid_call_whatsapp"

2. "WARM" (Interest exists, but blocked by a barrier):
   - Budget constraint, authority constraint, or timing constraint.
   - Action: "schedule_callback" or "continue_conversation"

3. "COLD" (Polite brush-off, no buying intent):
   - Action: "graceful_exit" or "continue_conversation"

CURRENT CALL CONTEXT:
- Phone: ${callState.phoneNumber}
- Known Lead Details: ${JSON.stringify(callState.leadDetails)}
- Previous Classification: ${callState.classification} (Score: ${callState.intentScore})
- Recent Transcript: ${JSON.stringify(callState.transcript.slice(-6))}
- Latest Customer Utterance: "${latestSpeech}"

Respond STRICTLY in JSON:
{
  "classification": "HOT" | "WARM" | "COLD" | "UNCLASSIFIED",
  "confidence": 0.9,
  "intentScore": 85,
  "reasons": ["Asking about pricing and start date"],
  "buyingSignals": ["Asked for instant WhatsApp info"],
  "barriers": ["none"],
  "recommendedAction": "send_mid_call_whatsapp"
}`;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.primaryModel}:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      if (!response.ok) {
        return defaultDecision;
      }

      const responseData = (await response.json()) as any;
      const textOutput = responseData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const cleanJson = textOutput.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsedJson = JSON.parse(cleanJson);

      const validated = qualificationDecisionSchema.safeParse(parsedJson);
      if (validated.success) {
        return validated.data;
      }
      return defaultDecision;
    } catch (err: any) {
      return defaultDecision;
    }
  }

  private heuristicFallback(callState: CallState, speech: string): QualificationDecision {
    const text = speech.toLowerCase();

    if (text.includes('whatsapp') || text.includes('details') || text.includes('portfolio') || text.includes('price')) {
      return {
        classification: 'HOT',
        confidence: 0.85,
        intentScore: 80,
        reasons: ['Customer requested details or commercial terms.'],
        buyingSignals: ['Requested WhatsApp brochure'],
        barriers: [],
        recommendedAction: 'send_mid_call_whatsapp',
      };
    }

    if (text.includes('call me') || text.includes('tomorrow') || text.includes('schedule') || text.includes('later')) {
      return {
        classification: 'WARM',
        confidence: 0.8,
        intentScore: 60,
        reasons: ['Customer requested callback.'],
        buyingSignals: ['Willing to speak later'],
        barriers: ['timing_barrier'],
        recommendedAction: 'schedule_callback',
      };
    }

    return {
      classification: callState.classification || 'UNCLASSIFIED',
      confidence: 0.5,
      intentScore: callState.intentScore || 50,
      reasons: ['Standard conversational interaction.'],
      buyingSignals: [],
      barriers: [],
      recommendedAction: 'continue_conversation',
    };
  }
}

export const leadQualificationService = new LeadQualificationService();
