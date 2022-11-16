/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/jsx-no-constructed-context-values */
import 'react-app-polyfill/ie11'
import 'react-app-polyfill/stable'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { store } from 'app/store'
import { Provider } from 'react-redux'
import ContextsWrapper from 'Components/AppContext/ContextsWrapper'
import App, { TestComp } from 'App'
import { HelmetProvider } from 'react-helmet-async'
import Firebase, { FirebaseContext } from './Components/Firebase'
import 'normalize.css'
import '@fontsource/open-sans'
import 'lazysizes'
import 'lazysizes/plugins/unveilhooks/ls.unveilhooks'
import './index.scss'

const rootRef = document.getElementById('root')
const root = createRoot(rootRef)

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <FirebaseContext.Provider value={new Firebase()}>
          <ContextsWrapper>
            <App />
          </ContextsWrapper>
        </FirebaseContext.Provider>
      </Provider>
    </HelmetProvider>
    <TestComp />
  </React.StrictMode>,
)
