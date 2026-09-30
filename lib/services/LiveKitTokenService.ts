import { AccessToken, VideoGrant } from 'livekit-server-sdk';

export interface GenerateTokenOptions {
  roomName: string;
  participantIdentity: string;
  participantName?: string;
  metadata?: Record<string, any>;
  ttlSeconds?: number;
}

export interface LiveKitTokenResponse {
  token: string;
  wsUrl: string;
  roomName: string;
  participantIdentity: string;
  isMock?: boolean;
}

export class LiveKitTokenService {
  private static apiKey = process.env.LIVEKIT_API_KEY || 'devkey';
  private static apiSecret = process.env.LIVEKIT_API_SECRET || 'secretkey';
  private static livekitUrl = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880';

  /**
   * Generates a signed WebRTC AccessToken for a caller to join a LiveKit room.
   */
  public static async createRoomToken(options: GenerateTokenOptions): Promise<LiveKitTokenResponse> {
    const {
      roomName,
      participantIdentity,
      participantName = 'Web Guest',
      metadata = {},
      ttlSeconds = 3600,
    } = options;

    const apiKey = process.env.LIVEKIT_API_KEY || 'devkey';
    const apiSecret = process.env.LIVEKIT_API_SECRET || 'secretkey';
    const wsUrl = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880';

    try {
      const at = new AccessToken(apiKey, apiSecret, {
        identity: participantIdentity,
        name: participantName,
        ttl: ttlSeconds,
        metadata: JSON.stringify(metadata),
      });

      const grant: VideoGrant = {
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      };

      at.addGrant(grant);

      const token = await at.toJwt();

      return {
        token,
        wsUrl,
        roomName,
        participantIdentity,
        isMock: false,
      };
    } catch (err: any) {
      console.warn('[LiveKitTokenService] Error generating real JWT, generating fallback dev token:', err.message);
      // Fallback dev token string if keys missing
      return {
        token: `mock_jwt_token_${Buffer.from(JSON.stringify({ room: roomName, identity: participantIdentity })).toString('base64')}`,
        wsUrl,
        roomName,
        participantIdentity,
        isMock: true,
      };
    }
  }
}