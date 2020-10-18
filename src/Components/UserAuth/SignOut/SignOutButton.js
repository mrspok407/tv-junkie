import React from "react"
import { withFirebase } from "Components/Firebase"

const SESSION_STORAGE_KEY_SHOWS = "userShows"

const SignOutButton = ({ firebase }) => {
  const signOut = () => {
    sessionStorage.setItem(SESSION_STORAGE_KEY_SHOWS, JSON.stringify([]))
    firebase.signOut()
  }

  return (
    <button type="button" className="button" onClick={() => signOut()}>
      Sign Out
    </button>
  )
}

export default withFirebase(SignOutButton)
