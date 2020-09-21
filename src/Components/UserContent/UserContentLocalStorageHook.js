import { useState } from "react"

const LOCAL_STORAGE_KEY_WATCHING_SHOWS = "watchingShowsLocalS"
const LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES = "watchLaterMoviesLocalS"

const useUserContentLocalStorage = () => {
  const [userContent, setUserContent] = useState({
    watchingShows: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS)) || [],
    watchLaterMovies: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)) || []
  })

  const toggleMovieLS = ({ id, data = [] }) => {
    const movieExists = userContent.watchLaterMovies.find(item => item.id === id)
    const movie = Array.isArray(data) ? data.find(item => item.id === id) : data

    if (movieExists) {
      setUserContent(prevState => ({
        ...prevState,
        watchLaterMovies: [...prevState.watchLaterMovies.filter(item => item.id !== id)]
      }))
    } else {
      setUserContent(prevState => ({
        ...prevState,
        watchLaterMovies: [...userContent.watchLaterMovies, { ...movie, userWatching: movie && true }]
      }))
    }
  }

  const addShowLS = ({ id, data = [] }) => {
    if (userContent.watchingShows.find(item => item.id === id)) return
    const show = Array.isArray(data) ? data.find(item => item.id === id) : data

    setUserContent(prevState => ({
      ...prevState,
      watchingShows: [...userContent.watchingShows, { ...show, userWatching: show && true }]
    }))
  }

  const removeShowLS = ({ id }) => {
    setUserContent(prevState => ({
      ...prevState,
      watchingShows: [...prevState.watchingShows.filter(item => item.id !== id)]
    }))
  }

  const clearContentState = () => {
    setUserContent({ watchingShows: [], watchLaterMovies: [] })
  }

  return {
    ...userContent,
    toggleMovieLS,
    addShowLS,
    removeShowLS,
    clearContentState
  }
}

export default useUserContentLocalStorage
