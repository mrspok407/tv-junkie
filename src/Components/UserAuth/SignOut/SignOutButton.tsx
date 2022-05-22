import React, { useContext } from 'react'
import { AppContext } from 'Components/AppContext/AppContextHOC'

const SESSION_STORAGE_KEY_SHOWS = 'userShows'

const SignOutButton = () => {
  const { firebase, userContent } = useContext(AppContext)
  const signOut = () => {
    firebase.signOut().then(() => {
      userContent.resetContentState()
      sessionStorage.setItem(SESSION_STORAGE_KEY_SHOWS, JSON.stringify([]))
    })
  }

  return (
    <button type="button" className="button button--profile" onClick={() => signOut()}>
      Sign Out
    </button>
  )
}

export default SignOutButton
