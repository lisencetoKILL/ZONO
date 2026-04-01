import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const runtime = typeof globalThis !== 'undefined' ? globalThis : window

const patchTimingTarget = (target) => {
  if (!target || typeof target !== 'object') return
  if (typeof target.clearMarks !== 'function') target.clearMarks = () => {}
  if (typeof target.clearMeasures !== 'function') target.clearMeasures = () => {}
  if (typeof target.mark !== 'function') target.mark = () => {}
  if (typeof target.measure !== 'function') target.measure = () => {}
}

patchTimingTarget(runtime.performance)
patchTimingTarget(runtime.mgt)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
