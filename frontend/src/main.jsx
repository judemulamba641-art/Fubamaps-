import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ToastProvider } from './components/ToastContext' // 🔥 ajout

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <ToastProvider> {/* 🔥 wrapper global */}
            <App />
                </ToastProvider>
                  </StrictMode>,
                  )