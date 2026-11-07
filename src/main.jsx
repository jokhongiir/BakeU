import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Bakeu from './Bakeu'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Bakeu />
  </StrictMode>,
)
