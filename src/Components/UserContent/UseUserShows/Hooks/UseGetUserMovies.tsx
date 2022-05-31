/* eslint-disable import/no-cycle */
import { useEffect, useState } from 'react'
import { AuthUserInterface } from 'Components/UserAuth/Session/WithAuthentication/@Types'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { UserMoviesInterface } from '../UseUserShows'

type Hook = () => {
  userMovies: UserMoviesInterface[]
  loadingMovies: boolean
  listenerUserMovies: ({ uid }: AuthUserInterface['authUser']) => void
  handleUserMoviesOnClient: ({ id, data }: { id: number; data?: UserMoviesInterface }) => void
  resetStateUserMovies: () => void
}

const useGetUserMovies: Hook = () => {
  const { firebase, authUser } = useFrequentVariables()

  const [userMovies, setUserMovies] = useState<UserMoviesInterface[]>([])
  const [loadingMovies, setLoadingMovies] = useState(true)

  useEffect(
    () => () => {
      if (!authUser?.uid) return
      firebase.watchLaterMovies(authUser.uid).off()
    },
    [firebase, authUser],
  )

  const listenerUserMovies = ({ uid }: AuthUserInterface['authUser']) => {
    firebase.watchLaterMovies(uid).on('value', (snapshot: { val: () => UserMoviesInterface[] }) => {
      if (snapshot.val() === null) {
        setLoadingMovies(false)
        return
      }

      const movies: UserMoviesInterface[] = Object.values(snapshot.val()).map((movie) => movie)
      setUserMovies(movies)
      setLoadingMovies(false)
    })
  }

  const handleUserMoviesOnClient = ({ id, data }: { id: number; data?: UserMoviesInterface }) => {
    const movie = userMovies.find((movie) => movie.id === id)

    if (movie) {
      setUserMovies(userMovies.filter((movie) => movie.id !== id))
    } else {
      if (data === undefined) return
      setUserMovies([...userMovies, { ...data }])
    }
  }

  const resetStateUserMovies = () => {
    setUserMovies([])
  }

  return {
    userMovies,
    loadingMovies,
    listenerUserMovies,
    handleUserMoviesOnClient,
    resetStateUserMovies,
  }
}

export default useGetUserMovies
