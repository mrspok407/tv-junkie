import { AppContext } from 'Components/AppContext/AppContextHOC'
import { FirebaseContext } from 'Components/Firebase'
import React, { useState, useContext, useEffect } from 'react'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'

type Props = {
  id: string
}

const Test: React.FC<Props> = ({ id }) => {
  const { firebase, authUser } = useFrequentVariables()
  const [show, setShow] = useState<any>({})

  useEffect(() => {
    firebase.userShow({ uid: authUser?.uid, key: id }).on('value', (snapshot: any) => {
      const showData = snapshot.val()
      setShow(showData)
    })

    return () => {
      firebase.userShow({ uid: authUser?.uid, key: id }).off()
    }
  }, [id, firebase, authUser])

  return <div style={{ color: 'white' }}>{show.name}</div>
}

export default Test
