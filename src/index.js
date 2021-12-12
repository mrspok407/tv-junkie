import "react-app-polyfill/ie11"
import "react-app-polyfill/stable"
import React from "react"
import ReactDOM from "react-dom"
import App from "./App"
import { store } from "app/store"
import Firebase, { FirebaseContext } from "./Components/Firebase"
import { Provider } from "react-redux"
import "normalize.css"
import "@fontsource/open-sans"
import "lazysizes"
import "lazysizes/plugins/unveilhooks/ls.unveilhooks"
import "./index.scss"

ReactDOM.render(
  <Provider store={store}>
    <FirebaseContext.Provider value={new Firebase()}>
      <App />
    </FirebaseContext.Provider>
  </Provider>,
  document.getElementById("root")
)
