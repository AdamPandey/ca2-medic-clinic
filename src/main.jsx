import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/globals.css'
import App from './App.jsx'
import { ThemeProvider } from "@/components/theme-provider"
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'; 
import './calendar-dark.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme"> {/* <--- Wrap */}
      <App />
    </ThemeProvider>
  </StrictMode>,
)