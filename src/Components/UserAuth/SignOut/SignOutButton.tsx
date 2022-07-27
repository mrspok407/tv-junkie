import React from 'react'
import { userShowsListenersRefs } from 'Components/UserContent/UseUserShowsRed/DatabaseHandlers/Listeners/firebaseListeners'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { userMoviesListenersRefs } from 'Components/UserContent/UseUserMoviesRed/DatabaseHandlers/Listeners/firebaseListeners'

const SignOutButton = () => {
  const { firebase, authUser } = useFrequentVariables()

  const handleFirebaseRefs = () => {
    const { showsInfoRef, showsEpisodesRef } = userShowsListenersRefs(firebase, authUser.uid)
    const { moviesInfoRef } = userMoviesListenersRefs(firebase, authUser.uid)
    showsInfoRef.off()
    showsEpisodesRef.off()
    moviesInfoRef.off()
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
