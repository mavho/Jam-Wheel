import {useState} from 'react';

import './App.scss';
import LandingPage from './components/LandingPage/LandingPage';
import Banner from './components/TitleBanner/TitleBanner';
import {Section} from 'trunx';
import {JamWheel} from './components/JamWheel/JamWheel';

export interface Session {
  username: string;
  roomId: string;
  sessionId: string;
}

function App() {
  const [session, setSession] = useState<Session | null>({
    username: 'hello',
    roomId: 'hello',
    sessionId: 'hello',
  });
  console.log(session);
  return (
    <Section id="container" bulma={['is-widescreen', 'is-fullwidth', 'has-background-black']}>
      {session ? (
        <JamWheel />
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
