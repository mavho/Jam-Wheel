import {useState} from 'react';

import './App.scss';
import LandingPage from './components/LandingPage/LandingPage';
import Banner from './components/TitleBanner/TitleBanner';
import {Button, Section} from 'trunx';
import {JamWheel} from './components/JamWheel/JamWheel';
import {useSynth} from './hooks/useSynth';

export interface Session {
  username: string;
  roomId: string;
  sessionId: string;
}

function App() {
  const [session, setSession] = useState<Session | null>(null);

  const {isStarted, startAudio, bufferRef} = useSynth();

  const _setSession = async () => {
    console.log('set audio');
    await startAudio(); // unlocks audio context from this click
    console.log('set session');
    setSession({
      username: 'hello',
      roomId: 'hello',
      sessionId: 'hello',
    });
  };

  return (
    <Section id="container" bulma={['is-widescreen', 'is-fullwidth', 'has-background-black']}>
      <Button onClick={_setSession}>start audio</Button>
      {session && isStarted ? (
        <JamWheel bufferRef={bufferRef} canvasColor={0} />
      ) : (
        <>
          <Banner />
          <LandingPage
            maxRoomLength={8}
            maxUserLength={16}
            onRegistered={(newSession: Session) => setSession(newSession)}
          />
        </>
      )}
    </Section>
  );
}

export default App;
