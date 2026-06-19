import {
  Hero,
  Container,
  HeroBody
} from 'trunx'

function Banner() {

  return (
    < Hero
      className='is-bold has-background-black'
    >
      <HeroBody>
        <Container>
              <h6 
                id="title"
                className='title is-1 bad-script has-text-centered glow has-text-light'
                is='1'
              >
                  Jam Wheel
              </h6>

        </Container>
      </HeroBody>

    </Hero>

    
  )

}

export default Banner