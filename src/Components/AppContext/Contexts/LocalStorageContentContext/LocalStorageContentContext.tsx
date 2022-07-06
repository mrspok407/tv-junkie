import React, { useState, useEffect, useMemo, useCallback, createContext } from 'react'
import {
  INITIAL_VALUE_LOCAL_STORAGE_CONTENT,
  LocalStorageContentInt,
  LocalStorageProviderInt,
  LOCAL_STORAGE_KEY_WATCHING_SHOWS,
  LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES,
  HandlersLocalStorageInt,
} from './@Types'

export const LocalStorageValueContext = createContext<LocalStorageContentInt['data']>(
  INITIAL_VALUE_LOCAL_STORAGE_CONTENT.data,
)
export const LocalStorageHandlersContext = createContext<LocalStorageContentInt['handlers']>(
  INITIAL_VALUE_LOCAL_STORAGE_CONTENT.handlers,
)

export const LocalStorageProvider = ({ data, handlers, children }: LocalStorageProviderInt) => {
  return (
    <LocalStorageValueContext.Provider value={data}>
      <LocalStorageHandlersContext.Provider value={handlers}>{children}</LocalStorageHandlersContext.Provider>
    </LocalStorageValueContext.Provider>
  )
}

const useLocalStorageContext = () => {
  const [localStorageContent, setLocalStorageContent] = useState<LocalStorageContentInt['data']>({
    watchingShows: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS)!) || [],
    watchLaterMovies: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)!) || [],
  })

  const toggleMovie = useCallback(({ id, data }: HandlersLocalStorageInt) => {
    const handleStateChange = (prevState: LocalStorageContentInt['data']) => {
      const movieExists = prevState.watchLaterMovies.find((item: { id: number }) => item.id === id)

      let newWatchLaterMovies = []
      if (movieExists) {
        newWatchLaterMovies = [...prevState.watchLaterMovies.filter((item: { id: number }) => item.id !== id)]
      } else {
        newWatchLaterMovies = [...prevState.watchLaterMovies, { ...data, userWatching: !!data }]
      }

      return {
        ...prevState,
        watchLaterMovies: newWatchLaterMovies,
      }
    }
    setLocalStorageContent(handleStateChange)
  }, [])

  const toggleShow = useCallback(({ id, data, userShowStatus }: HandlersLocalStorageInt) => {
    const handleStateChange = (prevState: LocalStorageContentInt['data']) => {
      const showsExists = prevState.watchingShows.find((item: { id: number }) => item.id === id)

      if (showsExists && userShowStatus !== 'watchingShows') {
        return {
          ...prevState,
          watchingShows: [...prevState.watchingShows.filter((item) => item.id !== id)],
        }
      }

      if (!showsExists && userShowStatus === 'watchingShows') {
        return {
          ...prevState,
          watchingShows: [...prevState.watchingShows, { ...data, userWatching: !!data, database: userShowStatus }],
        }
      }
      return { ...prevState }
    }

    setLocalStorageContent(handleStateChange)
  }, [])

  const clearLocalStorageContent = useCallback(() => {
    setLocalStorageContent({ watchingShows: [], watchLaterMovies: [] })
    localStorage.removeItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS)
    localStorage.removeItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)
  }, [])

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS, JSON.stringify(localStorageContent.watchingShows))
    localStorage.setItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES, JSON.stringify(localStorageContent.watchLaterMovies))
  }, [localStorageContent])

  const handlers = useMemo(
    () => ({
      toggleMovie,
      toggleShow,
      clearLocalStorageContent,
    }),
    [toggleMovie, toggleShow, clearLocalStorageContent],
  )

  return [localStorageContent, handlers] as const
}

export default useLocalStorageContext
