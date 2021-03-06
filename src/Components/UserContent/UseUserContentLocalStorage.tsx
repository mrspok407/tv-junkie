import { ToggleMovieLSArg } from "Components/AppContext/AppContextHOC"
import { useState, useEffect } from "react"
import { ContentDetailes } from "Utils/Interfaces/ContentDetails"

const LOCAL_STORAGE_KEY_WATCHING_SHOWS = "watchingShowsLocalS"
const LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES = "watchLaterMoviesLocalS"

interface UserContent {
  watchingShows: ContentDetailes[]
  watchLaterMovies: ContentDetailes[]
}

const useUserContentLocalStorage = () => {
  const [userContent, setUserContent] = useState<UserContent>({
    watchingShows: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS)!) || [], // ! means, that I'm telling to TS that I'm confident there will no null value
    watchLaterMovies: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)!) || []
  })

  const toggleMovieLS = ({ id, data }: ToggleMovieLSArg) => {
    const movieExists = userContent.watchLaterMovies.find((item: { id: number }) => item.id === id)
    const movie = Array.isArray(data) ? data.find((item: { id: number }) => item.id === id)! : data

    if (movieExists) {
      setUserContent({
        ...userContent,
        watchLaterMovies: [...userContent.watchLaterMovies.filter((item: { id: number }) => item.id !== id)]
      })
    } else {
      setUserContent({
        ...userContent,
        watchLaterMovies: [...userContent.watchLaterMovies, { ...movie, userWatching: !!movie }]
      })
    }
  }

  const addShowLS = ({ id, data = [] }: ToggleMovieLSArg) => {
    if (userContent.watchingShows.find((item) => item.id === id)) return
    const show: any = Array.isArray(data) ? data.find((item) => item.id === id) : data

    setUserContent((prevState) => ({
      ...prevState,
      watchingShows: [...userContent.watchingShows, { ...show, userWatching: show && true }]
    }))
  }

  const removeShowLS = ({ id }: { id: number }) => {
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
