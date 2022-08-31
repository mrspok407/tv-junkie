import { useContext } from 'react'
import { FirebaseContext } from './FirebaseContext'

const useFirebase = () => {
  const firebase = useContext(FirebaseContext)
  return firebase
}

export default useFirebase
