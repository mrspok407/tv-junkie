import "react-app-polyfill/ie11"
import "react-app-polyfill/stable"
import React from "react"
import ReactDOM from "react-dom"
import App from "./App"
import Firebase, { FirebaseContext } from "./Components/Firebase"
import "normalize.css"
import "./index.scss"

ReactDOM.render(
  <FirebaseContext.Provider value={new Firebase()}>
    <App />
  </FirebaseContext.Provider>,
  document.getElementById("root")
)
