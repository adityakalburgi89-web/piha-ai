'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Room, RoomEvent, Track, RemoteTrack } from 'livekit-client';
import {
  FiMic,
  FiMicOff,
  FiPhoneOff,
  FiVolume2,
  FiActivity,
  FiZap,
  FiMessageSquare,
  FiCalendar,
  FiDatabase,
  FiCheckCircle,
  FiX,
  FiRefreshCw,
  FiShield,
} from 'react-icons/fi';

interface LiveKitVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLanguage?: string;
}

interface TranscriptTurn {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  language: string;
}

interface AsyncSideEffect {
  id: string;
  type: 'whatsapp' | 'calendar' | 'supabase';
  label: string;
  status: 'pending' | 'success';
  timestamp: string;
}

const SUPPORTED_LANGUAGES = [
  { code: 'kn-IN', label: 'ಕನ್ನಡ (Kannada)', voice: 'Sarvam Ishita' },
  { code: 'hi-IN', label: 'हिंदी (Hindi)', voice: 'Sarvam Arvind' },
  { code: 'te-IN', label: 'తెలుగు (Telugu)', voice: 'Sarvam Meera' },
  { code: 'en-IN', label: 'English (IN)', voice: 'Cartesia Sonic' },
];

export const LiveKitVoiceModal: React.FC<LiveKitVoiceModalProps> = ({
  isOpen,
  onClose,
  initialLanguage = 'kn-IN',
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLanguage);
  const [callState, setCallState] = useState<'idle' | 'connecting' | 'connected' | 'listening' | 'speaking' | 'barge_in'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [turnaroundLatency, setTurnaroundLatency] = useState(485);
  const [transcripts, setTranscripts] = useState<TranscriptTurn[]>([]);
  const [sideEffects, setSideEffects] = useState<AsyncSideEffect[]>([]);
  const [bargeInCount, setBargeInCount] = useState(0);

  const roomRef = useRef<Room | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Initialize or start call session
  const startCall = async () => {
    setCallState('connecting');
    setTranscripts([]);
    setSideEffects([]);
    setBargeInCount(0);

    try {
      // 1. Request signed token from LiveKit API
      const res = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLanguage,
          agentId: 'agent-outbound-sales',
          name: 'Business Lead',
        }),
      });

      const tokenData = await res.json();
      if (!tokenData.success || !tokenData.token) {
        throw new Error(tokenData.error || 'Failed to acquire LiveKit token');
      }

      // 2. Initialize real LiveKit WebRTC Room
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
        if (track.kind === Track.Kind.Audio) {
          const el = track.attach();
          el.id = 'livekit-remote-audio-el';
          document.body.appendChild(el);
          remoteAudioRef.current = el;
          setCallState('speaking');
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        track.detach().forEach((el) => el.remove());
        if (callState === 'speaking') {
          setCallState('listening');
        }
      });

      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const isAgentSpeaking = speakers.some((s) => s.identity !== room.localParticipant.identity);
        if (isAgentSpeaking) {
          setCallState('speaking');
        } else if (callState === 'speaking') {
          setCallState('listening');
        }
      });

      room.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
        try {
          const text = new TextDecoder().decode(payload);
          const data = JSON.parse(text);
          if (data.type === 'transcript' && data.turn) {
            setTranscripts((prev) => [...prev, data.turn]);
          } else if (data.type === 'side_effect' && data.effect) {
            setSideEffects((prev) => [...prev, data.effect]);
          }
        } catch {
          // ignore
        }
      });

      room.on(RoomEvent.Disconnected, () => {
        endCall();
      });

      const wsUrl = tokenData.wsUrl || 'wss://piha-ai-nas9iift.livekit.cloud';
      await room.connect(wsUrl, tokenData.token);
      await room.localParticipant.setMicrophoneEnabled(true);

      // 3. Request user microphone and setup visualizer
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      // 3. Setup Web Audio Analyser for live visualizer
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      setCallState('connected');

      // Initial greetings per language
      const greetings: Record<string, string> = {
        'kn-IN': 'ನಮಸ್ಕಾರ! ನಾನು ಪಿಹಾ ಎಐ ವತಿಯಿಂದ ಆರವ್ ಕರೆ ಮಾಡುತ್ತಿದ್ದೇನೆ. ನಿಮ್ಮ ಬ್ಯುಸಿನೆಸ್‌ಗಾಗಿ ನಮ್ಮ ಸ್ವಯಂಚಾಲಿತ ಔಟ್‌ಬೌಂಡ್ ವಾಯ್ಸ್ ಎಐ ಪರಿಹಾರಗಳ ಕುರಿತು ಮಾತನಾಡಲು ನಿಮ್ಮೊಂದಿಗೆ ಎರಡು ನಿಮಿಷ ಸಮಯವಿದೆಯೇ?',
        'hi-IN': 'नमस्ते! मैं पिहा एआई से आरव बात कर रहा हूँ। आपके बिज़नेस के लिए हमारे ऑटोमेटेड आउटबाउंड वॉइस एआई सॉल्यूशन्स के बारे में बात करने के लिए क्या आपके पास दो मिनट का समय है?',
        'te-IN': 'నమస్కారం! నేను పిహా AI నుండి ఆరవ్ మాట్లాడుతున్నాను. మీ వ్యాపారం కోసం మా ఆటోమేటెడ్ అవుట్‌బౌండ్ వాయిస్ AI సేవల గురించి మాట్లాడటానికి మీకు రెండు నిమిషాలు సమయం ఉంటుందా?',
        'en-IN': 'Hi there! This is Aarav calling from Piha AI. I am following up regarding your interest in our autonomous outbound voice AI solutions for businesses. Do you have two quick minutes to connect?',
      };

      setTimeout(() => {
        setCallState('speaking');
        setTranscripts((prev) => [
          ...prev,
          {
            id: `turn-agent-init`,
            sender: 'agent',
            text: greetings[selectedLanguage] || greetings['en-IN'],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            language: selectedLanguage,
          },
        ]);

        setTimeout(() => {
          setCallState('listening');
        }, 3200);
      }, 800);
    } catch (err: any) {
      console.warn('[LiveKitVoiceModal] Mic permission or token warning:', err);
      // Fallback: connect in demo simulator mode
      setCallState('connected');
      setTimeout(() => {
        setCallState('listening');
      }, 1000);
    }
  };

  // Toggle Microphone Mute
  const toggleMute = async () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (roomRef.current?.localParticipant) {
      await roomRef.current.localParticipant.setMicrophoneEnabled(!nextMuted);
    }
  };

  // End Call & Cleanup
  const endCall = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.remove();
      remoteAudioRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setCallState('idle');
  };

  // Canvas visualizer loop
  useEffect(() => {
    if (!isOpen || callState === 'idle') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(32);

    const render = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
      } else {
        // Fallback synthetic wave animation
        for (let i = 0; i < 32; i++) {
          const base = callState === 'speaking' ? 140 : callState === 'listening' ? 60 : 20;
          dataArray[i] = Math.max(10, Math.sin(Date.now() / 200 + i) * base + base / 2);
        }
      }

      // Calculate RMS audio level
      let sum = 0;
      for (let i = 0; i < 32; i++) sum += dataArray[i];
      const avg = sum / 32;
      setAudioLevel(Math.round(avg));

      // Barge-in detection trigger if user talks while agent is speaking
      if (callState === 'speaking' && avg > 45) {
        setCallState('barge_in');
        setBargeInCount((c) => c + 1);
        setTimeout(() => setCallState('listening'), 800);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw center glowing circular audio wave
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 65 + (avg / 255) * 40;

      // Glow effect
      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius * 1.4);
      if (callState === 'barge_in') {
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
        gradient.addColorStop(0.7, 'rgba(249, 115, 22, 0.4)');
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      } else if (callState === 'speaking') {
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.85)');
        gradient.addColorStop(0.6, 'rgba(6, 182, 212, 0.45)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.85)');
        gradient.addColorStop(0.6, 'rgba(168, 85, 247, 0.45)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Outer wave bars
      const bars = 28;
      const step = (Math.PI * 2) / bars;
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';

      for (let i = 0; i < bars; i++) {
        const val = dataArray[i % 32];
        const barHeight = Math.max(8, (val / 255) * 45);
        const angle = i * step;

        const x1 = centerX + Math.cos(angle) * (radius - 5);
        const y1 = centerY + Math.sin(angle) * (radius - 5);
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);

        ctx.strokeStyle =
          callState === 'barge_in'
            ? '#ef4444'
            : callState === 'speaking'
            ? '#10b981'
            : '#818cf8';

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isOpen, callState]);

  // Demo user speech simulation trigger
  const simulateUserTurn = (userQuery: string, agentReply: string, actionType?: 'whatsapp' | 'calendar') => {
    if (callState === 'idle') return;

    const userTurn: TranscriptTurn = {
      id: `turn-user-${Date.now()}`,
      sender: 'user',
      text: userQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      language: selectedLanguage,
    };

    setTranscripts((prev) => [...prev, userTurn]);
    setCallState('connecting');

    // Simulate 485ms LiveKit turnaround
    setTimeout(() => {
      setTurnaroundLatency(Math.floor(450 + Math.random() * 70));
      setCallState('speaking');

      const agentTurn: TranscriptTurn = {
        id: `turn-agent-${Date.now()}`,
        sender: 'agent',
        text: agentReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        language: selectedLanguage,
      };

      setTranscripts((prev) => [...prev, agentTurn]);

      if (actionType === 'whatsapp') {
        setSideEffects((prev) => [
          ...prev,
          {
            id: `side-wa-${Date.now()}`,
            type: 'whatsapp',
            label: 'WhatsApp Catalog & Pricing PDF Dispatched (< 1.2s)',
            status: 'success',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          },
        ]);
      } else if (actionType === 'calendar') {
        setSideEffects((prev) => [
          ...prev,
          {
            id: `side-cal-${Date.now()}`,
            type: 'calendar',
            label: 'Google Calendar VIP Consultation Confirmed (Tomorrow 4:30 PM IST)',
            status: 'success',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          },
        ]);
      }

      setTimeout(() => {
        setCallState('listening');
      }, 3500);
    }, 485);
  };

  if (!isOpen) return null;

  return (
    <div className="livekit-modal-overlay">
      <div className="livekit-modal-container">
        {/* Header */}
        <div className="livekit-modal-header">
          <div className="livekit-header-brand">
            <span className="livekit-pulse-dot" />
            <div>
              <h2 className="livekit-title">Piha AI — Interactive Voice Demo</h2>
              <p className="livekit-subtitle">Instant Natural Speech • 4 Indian Languages • WhatsApp Follow-up</p>
            </div>
          </div>
          <button onClick={() => { endCall(); onClose(); }} className="livekit-close-btn" aria-label="Close modal">
            <FiX size={20} />
          </button>
        </div>

        {/* Top Status Banner */}
        <div className="livekit-sla-bar">
          <div className="sla-pill">
            <FiZap className="sla-icon" />
            <span>Response Speed: <strong>Instant</strong></span>
          </div>
          <div className="sla-pill">
            <FiShield className="sla-icon" />
            <span>Natural Interruption: <strong>Active</strong></span>
          </div>
          <div className="sla-pill">
            <span className={`status-tag status-${callState}`}>
              {callState.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="livekit-modal-body">
          {/* Visualizer & Controls Column */}
          <div className="livekit-visualizer-pane">
            <div className="canvas-wrapper">
              <canvas ref={canvasRef} width={280} height={280} className="visualizer-canvas" />
              {callState === 'barge_in' && (
                <div className="barge-in-indicator">
                  <FiZap /> Listening to you...
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="language-selector-wrapper">
              <span className="section-label">Select Spoken Language:</span>
              <div className="language-pill-grid">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    className={`lang-pill ${selectedLanguage === lang.code ? 'active' : ''}`}
                    onClick={() => setSelectedLanguage(lang.code)}
                  >
                    <span>{lang.label}</span>
                    <small>{lang.voice}</small>
                  </button>
                ))}
              </div>
            </div>

            {/* Controls Bar */}
            <div className="livekit-controls-row">
              {callState === 'idle' ? (
                <button onClick={startCall} className="control-btn btn-start">
                  <FiMic size={20} />
                  <span>Start Live Voice Call</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={toggleMute}
                    className={`control-btn btn-round ${isMuted ? 'btn-muted' : 'btn-neutral'}`}
                    title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
                  >
                    {isMuted ? <FiMicOff size={20} /> : <FiMic size={20} />}
                  </button>
                  <button onClick={endCall} className="control-btn btn-round btn-danger" title="Disconnect Call">
                    <FiPhoneOff size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Quick Test Questions */}
            {callState !== 'idle' && (
              <div className="quick-prompts-wrapper">
                <span className="section-label">Quick Test Turns (Click to speak):</span>
                <div className="quick-prompts-list">
                  <button
                    className="prompt-chip"
                    onClick={() =>
                      simulateUserTurn(
                        selectedLanguage === 'kn-IN'
                          ? 'ದಯವಿಟ್ಟು ನನಗೆ ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಪ್ರಾಡಕ್ಟ್ ಬ್ರೋಷರ್ ಕಳುಹಿಸಿ.'
                          : 'Please send me the product brochure and pricing on WhatsApp.',
                        selectedLanguage === 'kn-IN'
                          ? 'ಖಂಡಿತ! ನಾನು ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಗೆ ಪಿಹಾ ಎಐ ಕಂಪ್ಲೀಟ್ ಕ್ಯಾಟಲಾಗ್ ಮತ್ತು ಬೆಲೆ ವಿವರಗಳನ್ನು ವಾಟ್ಸಾಪ್ ಮಾಡಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ.'
                          : 'Certainly! I have instantly dispatched the full catalog and enterprise pricing to your WhatsApp.',
                        'whatsapp'
                      )
                    }
                  >
                    💬 Ask for WhatsApp Brochure
                  </button>
                  <button
                    className="prompt-chip"
                    onClick={() =>
                      simulateUserTurn(
                        selectedLanguage === 'kn-IN'
                          ? 'ನಾಳೆ ಸಂಜೆ ನಾಲ್ಕು ಗಂಟೆಗೆ ಒಂದು ಕನ್ಸಲ್ಟೇಶನ್ ಕಾಲ್ ಫಿಕ್ಸ್ ಮಾಡಿ.'
                          : 'Can you schedule a meeting tomorrow evening at 4:30 PM IST?',
                        selectedLanguage === 'kn-IN'
                          ? 'ಆಯಿತು, ನಾಳೆ ಸಂಜೆ 4:30 ಕ್ಕೆ ಗೂಗಲ್ ಮೀಟ್ ಇನ್ವೈಟ್ ರಿಸರ್ವ್ ಮಾಡಲಾಗಿದೆ. ನಿಮ್ಮ ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಲಿಂಕ್ ಕಳುಹಿಸಲಾಗಿದೆ.'
                          : 'Done! Your consultation is locked for tomorrow at 4:30 PM IST. Google Meet link dispatched.',
                        'calendar'
                      )
                    }
                  >
                    📅 Schedule Demo on Calendar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Real-Time Transcript & Side-Effect Bus Column */}
          <div className="livekit-data-pane">
            {/* Live Streaming Transcript */}
            <div className="data-box transcript-box">
              <div className="data-box-header">
                <div className="header-title">
                  <FiActivity className="icon-pulse" />
                  <span>Live Streaming Transcript</span>
                </div>
                <span className="badge-count">{transcripts.length} turns</span>
              </div>
              <div className="transcript-scroll-area">
                {transcripts.length === 0 ? (
                  <div className="empty-state">
                    <FiMic className="empty-icon" />
                    <p>Start call or speak into microphone to begin conversation</p>
                  </div>
                ) : (
                  transcripts.map((t) => (
                    <div key={t.id} className={`transcript-bubble bubble-${t.sender}`}>
                      <div className="bubble-meta">
                        <span className="sender-tag">{t.sender === 'user' ? '👤 Caller' : '🤖 Piha AI'}</span>
                        <span className="time-tag">{t.timestamp}</span>
                      </div>
                      <p className="bubble-text">{t.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Real-time Actions Stream */}
            <div className="data-box side-effects-box">
              <div className="data-box-header">
                <div className="header-title">
                  <FiZap className="icon-bolt" />
                  <span>Live Automated Actions</span>
                </div>
                <span className="badge-count">{sideEffects.length} dispatched</span>
              </div>
              <div className="side-effects-list">
                {sideEffects.length === 0 ? (
                  <div className="empty-side-effects">
                    <p>Automated actions like WhatsApp brochures and calendar invites sent during the call appear here.</p>
                  </div>
                ) : (
                  sideEffects.map((se) => (
                    <div key={se.id} className="side-effect-item">
                      <FiCheckCircle className="se-icon-success" />
                      <div className="se-content">
                        <span className="se-label">{se.label}</span>
                        <span className="se-time">{se.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};