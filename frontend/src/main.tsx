import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css';
import { BrowserRouter } from "react-router-dom"
import App from './App.tsx'
import './i18n';
import { applyTheme, getStoredTheme } from './utils/theme';

applyTheme(getStoredTheme());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
