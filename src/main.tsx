import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

if (import.meta.env.PROD) {
  const noop = () => {};
  (console as any).log = noop;
  (console as any).info = noop;
  (console as any).debug = noop;
  (console as any).warn = noop;
  (console as any).error = noop;
  (console as any).group = noop;
  (console as any).groupEnd = noop;
  (console as any).groupCollapsed = noop;
  (console as any).table = noop;
  (console as any).trace = noop;
  (console as any).dir = noop;
}

createRoot(document.getElementById("root")!).render(<App />);
