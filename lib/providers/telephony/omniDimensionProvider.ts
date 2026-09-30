import { ITelephonyProvider, StartCallParams, TelephonyCallResult } from '../../core/interfaces/ITelephonyProvider';
import { CallState } from '../../core/types/callState';
import { callStateStore } from '../../services/CallStateStore';
import { env } from '../../config/env';

export class OmniDimensionProvider implements ITelephonyProvider {
  public name = 'omnidimension';

  public async startCall(params: StartCallParams): Promise<TelephonyCallResult> {
    const apiKey = env.OMNIDIMENSION_API_KEY;
    const agentId = env.OMNIDIMENSION_AGENT_ID;

    const initialGreeting =
      params.greeting ||
      'Hey! This is Neha from Piha AI. We help businesses build custom online stores. Do you have a couple of minutes to chat?';

    if (!apiKey || apiKey === 'dummy_key' || !agentId || agentId === 'dummy_agent') {
      const mockCallId = `omn_mock_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const callState = callStateStore.createCall(params.phoneNumber, mockCallId, params.userId);
      callStateStore.updateStatus(mockCallId, 'initiated');

      return {
        callId: mockCallId,
        status: 'initiated',
        rawPayload: {
          mock: true,
          message: 'Initiated simulated call (OmniDimension API key/agent ID not set in .env)',
          firstSentence: initialGreeting,
        },
      };
    }

    try {
      const endpoint = 'https://omnidim.io/api/v1/calls/dispatch';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: parseInt(agentId, 10) || agentId,
          to_number: params.phoneNumber,
          phone_number: params.phoneNumber,
          first_sentence: initialGreeting,
          custom_variables: {
            persona_name: params.personaName || 'Neha',
            agent_name: params.agentName || 'Piha AI Assistant',
            greeting: initialGreeting,
            system_prompt: params.systemPrompt || '',
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let userFriendlyError = errorText;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed.error === 'concurrency_limit_exceeded' || parsed.error_description?.includes('concurrent call limit')) {
            userFriendlyError = 'A call is already in progress. Please wait a moment for the active call to finish before starting a new one.';
          } else if (parsed.error_description) {
            userFriendlyError = parsed.error_description;
          }
        } catch {
          // Keep raw text if not JSON
        }
        throw new Error(userFriendlyError);
      }

      const data = (await response.json()) as { call_id?: string; status?: string };
      const callId = data.call_id || `omn_${Date.now()}`;
      callStateStore.createCall(params.phoneNumber, callId, params.userId);
      callStateStore.updateStatus(callId, 'initiated');

      return {
        callId,
        status: 'initiated',
        rawPayload: data,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(errorMessage);
    }
  }

  public async getCallStatus(callId: string): Promise<CallState | null> {
    return callStateStore.getCall(callId);
  }
}

export const omniDimensionProvider = new OmniDimensionProvider();
