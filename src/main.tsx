import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// #region agent log
fetch('http://127.0.0.1:7751/ingest/6115d109-c995-412e-914f-0861b53b07f4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'469cae'},body:JSON.stringify({sessionId:'469cae',location:'main.tsx:pre-import',message:'main.tsx starting before App import',data:{},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
// #endregion

import('./App.tsx')
  .then(({ default: App }) => {
    // #region agent log
    fetch('http://127.0.0.1:7751/ingest/6115d109-c995-412e-914f-0861b53b07f4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'469cae'},body:JSON.stringify({sessionId:'469cae',location:'main.tsx:app-imported',message:'App module loaded successfully',data:{},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
  .catch((err) => {
    // #region agent log
    fetch('http://127.0.0.1:7751/ingest/6115d109-c995-412e-914f-0861b53b07f4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'469cae'},body:JSON.stringify({sessionId:'469cae',location:'main.tsx:import-error',message:'App module failed to load',data:{error:String(err)},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    console.error('Failed to load App:', err)
  })
