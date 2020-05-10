import React from "react"
import ReactDOM from "react-dom"
import "normalize.css"
import "./index.scss"
import App from "./App"
import Firebase, { FirebaseContext } from "./Components/Firebase"

ReactDOM.render(
  <FirebaseContext.Provider value={new Firebase()}>
    <App />
  </FirebaseContext.Provider>,
  document.getElementById("root")
)
