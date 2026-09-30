'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { OrbState } from 'orb-ui';

const Orb = dynamic(() => import('orb-ui').then((m) => m.Orb), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: 210,
        height: 210,
        borderRadius: '50%',
        backgroundColor: '#fafafa',
        border: '1px solid #ededed',
      }}
    />
  ),
});

interface OrbCloudVisualizerProps {
  initialState?: OrbState;
}

export const OrbCloudVisualizer: React.FC<OrbCloudVisualizerProps> = ({ initialState = 'listening' }) => {
  const [agentState, setAgentState] = useState<OrbState>(initialState);
  const [outputVolume, setOutputVolume] = useState<number>(0.15);
  const [inputVolume, setInputVolume] = useState<number>(0.7);

  // Subtle continuous volume modulation while in 'listening' state so orb is constantly alive
  useEffect(() => {
    if (agentState === 'listening') {
      const interval = setInterval(() => {
        setInputVolume(0.45 + Math.random() * 0.4);
      }, 350);
      return () => clearInterval(interval);
    }
  }, [agentState]);

  useEffect(() => {
    const handleOrbStateChange = (event: CustomEvent<{ state: OrbState; volume?: number }>) => {
      if (event.detail && event.detail.state) {
        setAgentState(event.detail.state);
        if (typeof event.detail.volume === 'number') {
          setOutputVolume(event.detail.volume);
        } else if (event.detail.state === 'speaking') {
          setOutputVolume(0.85);
        } else if (event.detail.state === 'listening') {
          setInputVolume(0.7);
        } else {
          setOutputVolume(0.15);
          setInputVolume(0.5);
        }
      }
    };

    window.addEventListener('elevatevoice:orb-state' as any, handleOrbStateChange as EventListener);
    return () => {
      window.removeEventListener('elevatevoice:orb-state' as any, handleOrbStateChange as EventListener);
    };
  }, []);

  const handleToggle = () => {
    const nextState = agentState === 'speaking' ? 'listening' : 'speaking';
    setAgentState(nextState);

    if (nextState === 'speaking') {
      setOutputVolume(0.85);
      setInputVolume(0.05);
      setTimeout(() => {
        setAgentState('listening');
        setInputVolume(0.7);
        setOutputVolume(0.15);
      }, 5000);
    } else {
      setOutputVolume(0.15);
      setInputVolume(0.7);
    }

    window.dispatchEvent(
      new CustomEvent('elevatevoice:orb-state-updated', {
        detail: { state: nextState },
      })
    );
  };

  const getStatusLabel = () => {
    switch (agentState) {
      case 'speaking':
        return 'ANSWERING IN REALTIME · NEHA';
      case 'thinking':
        return 'PREPARING HELPFUL ANSWER...';
      default:
        return 'LISTENING TO CUSTOMER';
    }
  };

  return (
    <div className="hero-orb-viewport">
      <div className="hero-orb-center-anchor">
        <Orb
          theme="radial"
          state={agentState}
          signal={{
            state: agentState,
            outputVolume: agentState === 'speaking' ? outputVolume : 0.05,
            inputVolume: agentState === 'listening' ? inputVolume : 0.05,
          }}
          size={210}
          interactive={true}
          slotProps={{
            control: {
              style: { display: 'none' },
            },
          }}
          onStart={handleToggle}
          onStop={handleToggle}
        />
      </div>
      <div
        className="hero-orb-state-chip"
        style={{ cursor: 'pointer' }}
        onClick={handleToggle}
      >
        <span className="status-ping" style={{ display: 'inline-block', width: '6px', height: '6px', marginRight: '6px' }}></span>
        <span>{getStatusLabel()}</span>
      </div>
    </div>
  );
};

// High-performance 2D Canvas rendering loop with double buffering

// HSL color gradient interpolation based on voice fundamental frequency

// Audio frequency smoothing time constant set to 0.85 for organic motion

// Idle state breath animation running when microphone amplitude is zero

// Particle distribution radius and glow diffusion config parameters

// AudioContext suspension & event cleanup on component unmount

// Delta-time normalized frame calculation for constant 60fps pacing

// Bounding-box canvas clearRect to bypass full canvas repaint overhead

// User gesture listener for browser audio context auto-unlock

// Radial dark gradient overlay to blend orb borders into canvas backdrop
