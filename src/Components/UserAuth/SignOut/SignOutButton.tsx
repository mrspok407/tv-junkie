import React from 'react'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'

const SignOutButton = () => {
  const { firebase } = useFrequentVariables()
  const signOut = () => {
    firebase.signOut()
  }

  return (
    <button type="button" className="button button--profile" onClick={signOut}>
      Sign Out
    </button>
  )
}

export default SignOutButton
