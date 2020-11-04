import { useState, useEffect } from "react"

const LOCAL_STORAGE_KEY_WATCHING_SHOWS = "watchingShowsLocalS"
const LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES = "watchLaterMoviesLocalS"

interface FunctionArguments {
  id: number | string
  data: { id: number }[] | { id: number }
}

interface UserContent {
  watchingShows: { id: number }[]
  watchLaterMovies: { id: number; userWatching: boolean }[]
}

const useUserContentLocalStorage = () => {
  const [userContent, setUserContent] = useState<UserContent>({
    watchingShows: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS)!) || [], // ! means, that I'm telling to TS that I'm confident there will no null value
    watchLaterMovies: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)!) || []
  })

  const toggleMovieLS = ({ id, data = [] }: FunctionArguments) => {
    const movieExists = userContent.watchLaterMovies.find((item: { id: number }) => item.id === id)
    const movie: any = Array.isArray(data) ? data.find((item: { id: number }) => item.id === id) : data

    if (movieExists) {
      setUserContent((prevState) => ({
        ...prevState,
        watchLaterMovies: [...prevState.watchLaterMovies.filter((item: { id: number }) => item.id !== id)]
      }))
    } else {
      setUserContent((prevState) => ({
        ...prevState,
        watchLaterMovies: [...prevState.watchLaterMovies, { ...movie, userWatching: movie && true }]
      }))
    }
  }

  const addShowLS = ({ id, data = [] }: FunctionArguments) => {
    if (userContent.watchingShows.find((item) => item.id === id)) return
    const show: any = Array.isArray(data) ? data.find((item) => item.id === id) : data

    setUserContent((prevState) => ({
      ...prevState,
      watchingShows: [...userContent.watchingShows, { ...show, userWatching: show && true }]
    }))
  }

  const removeShowLS = ({ id }: FunctionArguments) => {
    setUserContent((prevState) => ({
      ...prevState,
      watchingShows: [...prevState.watchingShows.filter((item) => item.id !== id)]
    }))
  }

  const clearContentState = () => {
    setUserContent({ watchingShows: [], watchLaterMovies: [] })
  }

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS, JSON.stringify(userContent.watchingShows))
    localStorage.setItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES, JSON.stringify(userContent.watchLaterMovies))
  }, [userContent])

  return {
    ...userContent,
    toggleMovieLS,
    addShowLS,
    removeShowLS,
    clearContentState
  }
}

export default useUserContentLocalStorage
