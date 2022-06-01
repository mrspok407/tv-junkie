import { useState, useEffect } from 'react'
import useFrequentVariables from '../../../../Utils/Hooks/UseFrequentVariables'

const useNewContactsActivity = () => {
  const { firebase, authUser } = useFrequentVariables()

  const [newActivity, setNewActivity] = useState(false)
  const [newRequests, setNewRequests] = useState(false)

  const [newContactsActivity, setNewContactsActivity] = useState(false)

  useEffect(() => {
    firebase.newContactsActivity({ uid: authUser?.uid }).on('value', (snapshot: any) => {
      setNewActivity(!!snapshot.exists())
    })
    firebase.newContactsRequests({ uid: authUser?.uid }).on('value', (snapshot: any) => {
      setNewRequests(!!snapshot.exists())
    })

    return () => {
      firebase.newContactsActivity({ uid: authUser?.uid }).off()
      firebase.newContactsRequests({ uid: authUser?.uid }).off()
    }
  }, [authUser, firebase])

  useEffect(() => {
    setNewContactsActivity(!!(newActivity || newRequests))
  }, [newActivity, newRequests])

  return newContactsActivity
}

export default useNewContactsActivity
