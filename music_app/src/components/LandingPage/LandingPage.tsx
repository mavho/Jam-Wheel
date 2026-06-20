import type {Bulma} from 'trunx';
import {Section, Div, Columns, Column} from 'trunx';
import './LandingPage.scss';

function LandingPage() {
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
                <input
                  id="room_input"
                  className="input has-text-grey-lighter"
                  type="text"
                  placeholder="Enter Room Name..."
                />
                <div className="has-text-grey-lighter" id="room_counter">
                  8
                </div>
              </Column>
              <Column>
                <input
                  id="username_input"
                  className="input has-text-grey-lighter"
                  type="text"
                  placeholder="Enter UserName..."
                />
                <div className="has-text-grey-lighter has-text-right" id="user_counter">
                  16
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
                collaboraters.
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
