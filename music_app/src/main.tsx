import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.scss'

import LandingPage from './components/LandingPage/LandingPage'
import Banner from './components/TitleBanner/TitleBanner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Banner />
    <LandingPage />
  </StrictMode>,
)
