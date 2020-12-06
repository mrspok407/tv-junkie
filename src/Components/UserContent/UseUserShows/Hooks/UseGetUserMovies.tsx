import { useContext, useEffect, useState } from "react"
import { FirebaseContext } from "Components/Firebase"
import { UserMoviesInterface } from "../UseUserShows"
import useAuthUser from "Components/UserAuth/Session/WithAuthentication/UseAuthUser"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"

type Hook = () => {
  userMovies: UserMoviesInterface[]
  loadingMovies: boolean
  listenerUserMovies: ({ uid }: AuthUserInterface) => void
  handleUserMoviesOnClient: ({ id, data }: { id: number; data?: UserMoviesInterface }) => void
  resetStateUserMovies: () => void
}

const useGetUserMovies: Hook = () => {
  const [userMovies, setUserMovies] = useState<UserMoviesInterface[]>([])
  const [loadingMovies, setLoadingMovies] = useState(true)

  const firebase = useContext(FirebaseContext)
  const authUser = useAuthUser()

  useEffect(() => {
    return () => {
      if (!authUser) return
      firebase.watchLaterMovies(authUser.uid).off()
    }
  }, [firebase, authUser])

  const listenerUserMovies = ({ uid }: AuthUserInterface) => {
    firebase.watchLaterMovies(uid).on("value", (snapshot: { val: () => UserMoviesInterface[] }) => {
      if (snapshot.val() === null) {
        setLoadingMovies(false)
        return
      }

      const movies: UserMoviesInterface[] = Object.values(snapshot.val()).map((movie) => {
        return movie
      })
      console.log({ movies })
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
    resetStateUserMovies
  }
}

export default useGetUserMovies
