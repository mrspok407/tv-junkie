import React from 'react'
import { userShowsListenersRefs } from 'Components/UserContent/UseUserShowsRed/DatabaseHandlers/Listeners/firebaseListeners'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'

const SignOutButton = () => {
  const { firebase, authUser } = useFrequentVariables()

  const handleFirebaseRefs = () => {
    const { showsInfoRef, showsEpisodesRef } = userShowsListenersRefs(firebase, authUser.uid)
    showsInfoRef.off()
    showsEpisodesRef.off()
  }

  const handleSignOut = () => {
    handleFirebaseRefs()
    firebase.signOut()
  }

  return (
    <button type="button" className="button button--profile" onClick={handleSignOut}>
      Sign Out
    </button>
  )
}

export default SignOutButton
