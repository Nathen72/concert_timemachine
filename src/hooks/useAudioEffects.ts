import { useEffect, useRef, useCallback } from 'react';

export const useAudioEffects = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const crowdAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize Web Audio API
    audioContextRef.current = new AudioContext();

    // Create reverb effect
    const convolver = audioContextRef.current.createConvolver();
    // Create simple impulse response for reverb
    const impulseLength = audioContextRef.current.sampleRate * 2;
    const impulse = audioContextRef.current.createBuffer(
      2,
      impulseLength,
      audioContextRef.current.sampleRate
    );

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < impulseLength; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impulseLength, 2);
      }
    }

    convolver.buffer = impulse;
    reverbNodeRef.current = convolver;

    // Load crowd applause sound (will be loaded if file exists)
    crowdAudioRef.current = new Audio('/audio/crowd-applause.mp3');
    crowdAudioRef.current.loop = false;
    crowdAudioRef.current.volume = 0.3;

    // Handle error if crowd audio file doesn't exist
    crowdAudioRef.current.addEventListener('error', () => {
      console.log('Crowd applause audio file not found. Add crowd-applause.mp3 to public/audio/ for crowd effects.');
    });

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const playCrowdApplause = useCallback(() => {
    if (crowdAudioRef.current) {
      crowdAudioRef.current.currentTime = 0;
      crowdAudioRef.current.play().catch((error) => {
        console.log('Could not play crowd applause:', error);
      });
    }
  }, []);

  return { playCrowdApplause, audioContext: audioContextRef.current };
};
