import { createRoot } from 'react-dom/client'
import { Takt, TaktEvent } from '@vskstudio/takt-react'

// excludeLocalhost is forced off: the e2e server runs on localhost, where core
// otherwise suppresses every event.
function App() {
  return (
    <Takt domain="example.com" endpoint="/api/event" excludeLocalhost={false}>
      <h1>Takt React e2e</h1>
      <TaktEvent name="Signup" props={{ plan: 'pro' }}>
        <button id="signup">Sign up</button>
      </TaktEvent>
      <a
        id="nav"
        href="/about"
        onClick={(e) => {
          e.preventDefault()
          history.pushState({}, '', '/about')
        }}
      >
        About
      </a>
    </Takt>
  )
}

createRoot(document.getElementById('app')!).render(<App />)
