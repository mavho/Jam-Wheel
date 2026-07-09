import {useCallback, useRef, useState} from 'react';
import * as Tone from 'tone';

export function useSynth() {
  const [isStarted, setIsStarted] = useState(false);
  const bufferRef = useRef<Tone.ToneAudioBuffers | null>(null);

  const startAudio = useCallback(async () => {
    console.log('start audio');
    if (isStarted) return;

    await Tone.start();
    console.log('started');
    console.log('context state on mount:', Tone.getContext().state); // "suspended" is expected/fine here

    const buffers = new Tone.ToneAudioBuffers({
      urls: {
        A0: 'voice_45.mp3',
        A1: 'voice_48.mp3',
        A2: 'voice_50.mp3',
        A3: 'voice_52.mp3',
        A4: 'voice_55.mp3',
        A5: 'voice_57.mp3',
        A6: 'voice_60.mp3',
        A7: 'voice_62.mp3',
        A8: 'voice_64.mp3',
        A9: 'voice_67.mp3',
      },
      onload: () => {
        console.log('buffers loaded');
        bufferRef.current = buffers;
        setIsStarted(true);
      },
      onerror: error => {
        console.error(error);
      },
    });
  }, [isStarted]);

  return {isStarted, startAudio, bufferRef};
}
