import { ToggleDataLS } from 'Components/AppContext/@Types'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { MainDataTMDB } from 'Utils/@TypesTMDB'

const LOCAL_STORAGE_KEY_WATCHING_SHOWS = 'watchingShowsLocalS'
const LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES = 'watchLaterMoviesLocalS'

interface UserContent {
  watchingShows: MainDataTMDB[]
  watchLaterMovies: MainDataTMDB[]
}

const useUserContentLocalStorage = () => {
  const [userContent, setUserContent] = useState<UserContent>({
    watchingShows: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS)!) || [],
    watchLaterMovies: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)!) || [],
  })

  const toggleMovieLS = ({ id, data }: ToggleDataLS) => {
    const movieExists = userContent.watchLaterMovies.find((item: { id: number }) => item.id === id)
    const movie = data

    if (movieExists) {
      setUserContent({
        ...userContent,
        watchLaterMovies: [...userContent.watchLaterMovies.filter((item: { id: number }) => item.id !== id)],
      })
    } else {
      setUserContent({
        ...userContent,
        watchLaterMovies: [...userContent.watchLaterMovies, { ...movie, userWatching: !!movie }],
      })
    }
  }

  const toggleShowLS = ({ id, data, database }: ToggleDataLS) => {
    const show = userContent.watchingShows.find((item: { id: number }) => item.id === id)

    if (show && database !== 'watchingShows') {
      setUserContent((prevState) => ({
        ...prevState,
        watchingShows: [...prevState.watchingShows.filter((item) => item.id !== id)],
      }))
      return
    }

    if (!show && database === 'watchingShows') {
      setUserContent((prevState) => ({
        ...prevState,
        watchingShows: [...prevState.watchingShows, { ...data, userWatching: !!show, database: 'watchingShows' }],
      }))
    }
  }

  const clearContentState = useCallback(() => {
    setUserContent({ watchingShows: [], watchLaterMovies: [] })
  }, [])

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS, JSON.stringify(userContent.watchingShows))
    localStorage.setItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES, JSON.stringify(userContent.watchLaterMovies))
  }, [userContent])

  const result = useMemo(() => {
    return {
      ...userContent,
      toggleMovieLS,
      toggleShowLS,
      clearContentState,
    }
  }, [clearContentState])

  return result

  // return {      ...userContent,
  //   toggleMovieLS,
  //   toggleShowLS,
  //   clearContentState,}
}

export default useUserContentLocalStorage
