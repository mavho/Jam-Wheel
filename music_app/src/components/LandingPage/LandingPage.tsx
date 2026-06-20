import type {Bulma} from 'trunx';
import {Section, Div, Columns, Column, Input} from 'trunx';
import './LandingPage.scss';
import {useState} from 'react';

interface LandingPagePropInterface {
  maxRoomLength: number;
  maxUserLength: number;
}

function LandingPage(props: LandingPagePropInterface) {
  const [roomInputValue, setRoomInputValue] = useState('');
  const [userInputValue, setUserInputValue] = useState('');

  const roomLength = props.maxRoomLength - roomInputValue.length;
  const userLength = props.maxUserLength - userInputValue.length;

  const roomInputBulma: Bulma[] = [roomLength < 0 ? 'is-danger' : 'has-text-grey-lighter'];
  const userInputBulma: Bulma[] = [userLength < 0 ? 'is-danger' : 'has-text-grey-lighter'];

  const onRoomInputVal = (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    setRoomInputValue(e.target.value.substring(0, props.maxRoomLength));
  };
  const onUserInputVal = (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    setUserInputValue(e.target.value.substring(0, props.maxUserLength));
  };

  return (
    <Section id="container" bulma={['is-widescreen', 'is-fullwidth', 'has-background-black']}>
      <Columns id="landing_page" bulma={'is-centered' satisfies Bulma}>
        <Column bulma={'is-half' satisfies Bulma}>
          <Div id="window" bulma="box">
            <Div bulma={['box', 'has-background-grey']}>
              <h1 className="has-text-grey-lighter">
                Jam Wheel is an interactive multiplayer jam session. Simply enter a room ID and
                username and start jamming!
              </h1>
            </Div>

            <Columns>
              <Column>
                <Input
                  id="room_input"
                  value={roomInputValue}
                  bulma={roomInputBulma}
                  type="text"
                  placeholder="Enter Room Name..."
                  onChange={onRoomInputVal}
                />
                <div className="has-text-grey-lighter" id="room_counter">
                  {roomLength}
                </div>
              </Column>
              <Column>
                <Input
                  id="username_input"
                  value={userInputValue}
                  bulma={userInputBulma}
                  type="text"
                  placeholder="Enter UserName..."
                  onChange={onUserInputVal}
                />
                <div className="has-text-grey-lighter has-text-right" id="user_counter">
                  {userLength}
                </div>
              </Column>
            </Columns>

            <Div bulma={['box', 'has-background-grey']}>
              <span id="room_join" className="button is-flex purple-button has-text-light">
                Join Room!
              </span>
            </Div>

            <Div bulma={['box', 'has-background-grey']}>
              <p className="has-text-grey-lighter">
                <strong className="has-text-grey-lighter">Jam Wheel</strong> is created by{' '}
                <a href="https://github.com/mavho/Jam-Wheel">Maverick Ho</a>. This site is still
                under active development, there is still much to work on. If you want to help
                collaborate email me at{' '}
                <a href="mailto:homaverick@gmail.com">homaverick@gmail.com</a> and I can set up
                collaborators.
              </p>
            </Div>
          </Div>
        </Column>
      </Columns>

      <Columns>
        <Column>
          <div id="sketch" className="tile is-bordered" />
        </Column>
      </Columns>
    </Section>
  );
}

export default LandingPage;
