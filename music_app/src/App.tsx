import {useState} from 'react';

import './App.scss';
import LandingPage from './components/LandingPage/LandingPage';
import Banner from './components/TitleBanner/TitleBanner';
import {Div} from 'trunx';

export interface Session {
  username: string;
  roomId: string;
  sessionId: string;
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  console.log(session);
  return (
    <>
      <Banner />
      {session ? (
        <Div>
          <p>Hello</p>
        </Div>
      ) : (
        <LandingPage
          maxRoomLength={8}
          maxUserLength={16}
          onRegistered={(newSession: Session) => setSession(newSession)}
        />
      )}
    </>
  );
}

export default App;
