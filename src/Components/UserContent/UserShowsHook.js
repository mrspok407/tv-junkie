/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react"
import { combineMergeObjects, releasedEpisodesToOneArray } from "Utils"
import { organiseFutureEpisodesByMonth } from "Components/CalendarPage/CalendarHelpers"
import merge from "deepmerge"

const SESSION_STORAGE_KEY_SHOWS = "userShows"

const useUserShows = (firebase) => {
  const [userShows, setUserShows] = useState([])
  const [userMovies, setUserMovies] = useState([])
  const [userWillAirEpisodes, setUserWillAirEpisodes] = useState([])
  const [userToWatchShows, setUserToWatchShows] = useState([])
  const [loadingShows, setLoadingShows] = useState(true)
  const [loadingNotFinishedShows, setLoadingNotFinishedShows] = useState(true)
  const [loadingMovies, setLoadingMovies] = useState(true)
  const [firebaseListeners, setFirebaseListeners] = useState([])

  const authUserListener = useCallback(() => {
    firebase.onAuthUserListener(
      (authUser) => {
        console.log("function run")
        firebase.userAllShows(authUser.uid).on("value", (snapshot) => {
          if (snapshot.val() === null) {
            setLoadingShows(false)
            return
          }

          console.log("listener on All User Shows")

          const shows = Object.values(snapshot.val()).map((show) => {
            return show
          })
          const userShowsSS = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY_SHOWS))
          const userShowsSSLength = userShowsSS.length

          if (userShowsSSLength === 0) {
            Promise.all(
              Object.values(snapshot.val()).map((show) => {
                return firebase
                  .showInDatabase(show.status, show.id)
                  .once("value")
                  .then((snapshot) => {
                    return {
                      ...show,
                      ...snapshot.val().info,
                      episodes: snapshot.val().episodes,
                    }
                  })
              })
            ).then((showsDatabase) => {
              const mergedShows = merge(shows, showsDatabase, {
                arrayMerge: combineMergeObjects,
              })

              const watchingShows = mergedShows.filter((show) => show.database === "watchingShows")

              const willAirEpisodes = organiseFutureEpisodesByMonth(watchingShows)

              setUserShows(mergedShows)
              setUserWillAirEpisodes(willAirEpisodes)
              setLoadingShows(false)
            })
          } else if (userShowsSSLength < shows.length) {
            shows.forEach((show, index) => {
              if (userShowsSS.find((item) => item.id === show.id)) return

              firebase.showInDatabase(show.status, show.id).once("value", (snapshot) => {
                const updatedShows = [...userShowsSS]
                const mergedShow = { ...show, ...snapshot.val().info, episodes: snapshot.val().episodes }

                updatedShows.splice(index, 0, mergedShow)

                const watchingShows = updatedShows.filter((show) => show.database === "watchingShows")

                const willAirEpisodes = organiseFutureEpisodesByMonth(watchingShows)

                setUserShows(updatedShows)
                setUserWillAirEpisodes(willAirEpisodes)
                setLoadingShows(false)
              })
            })
          } else if (userShowsSSLength === shows.length) {
            const mergedShows = merge(userShowsSS, shows, {
              arrayMerge: combineMergeObjects,
            })
            setUserShows(mergedShows)
          }
        })

        firebase.userEpisodesNotFinished(authUser.uid).on("value", (snapshot) => {
          if (snapshot.val() === null) {
            setUserToWatchShows([])
            setLoadingNotFinishedShows(false)
            return
          }

          const userEpisodes = Object.entries(snapshot.val()).reduce((acc, [key, value]) => {
            const releasedEpisodes = releasedEpisodesToOneArray({ data: value.episodes })

            if (releasedEpisodes.find((episode) => !episode.watched)) {
              acc.push({ id: Number(key), episodes: value.episodes })
            }
            return acc
          }, [])

          setUserToWatchShows(userEpisodes)
          setLoadingNotFinishedShows(false)
        })

        firebase.watchLaterMovies(authUser.uid).on("value", (snapshot) => {
          if (snapshot.val() === null) {
            setLoadingMovies(false)
            return
          }

          const movies = Object.values(snapshot.val()).map((movie) => {
            return movie
          })

          setUserMovies(movies)
          setLoadingMovies(false)
          setFirebaseListeners([
            firebase.userAllShows(authUser.uid),
            firebase.userEpisodesNotFinished(authUser.uid),
            firebase.watchLaterMovies(authUser.uid),
          ])
        })
      },
      () => {
        setLoadingShows(false)
        setLoadingMovies(false)
        console.log("user is nhhafot logged in")
      }
    )
  }, [firebase])

  useEffect(() => {
    console.log("userShowsHook mounted")
    authUserListener()
    return () => {
      console.log("userShowsHook unmounted")
      firebaseListeners.forEach((listener) => {
        listener.off()
      })
    }
  }, [])

  useEffect(() => {
    sessionStorage.setItem(SESSION_STORAGE_KEY_SHOWS, JSON.stringify(userShows))
    console.log("comp updated")
  }, [userShows])

  const handleUserShowsOnClient = ({ database, id }) => {
    const userShowsSS = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY_SHOWS))
    if (userShowsSS.find((show) => show.id === id) === undefined) return

    const updatedShows = userShowsSS.map((show) => (show.id === id ? { ...show, database } : show))

    const watchingShows = updatedShows.filter((show) => show.database === "watchingShows")
    const willAirEpisodes = organiseFutureEpisodesByMonth(watchingShows)

    setUserShows(updatedShows)
    setUserWillAirEpisodes(willAirEpisodes)

    console.log("upd on client")
  }

  const handleUserMoviesOnClient = ({ id }) => {
    const updatedMovies = userMovies.filter((movie) => movie.id !== id)

    console.log("upd on client movies")

    setUserMovies(updatedMovies)
  }

  return {
    userShows,
    userWillAirEpisodes,
    userToWatchShows,
    userMovies,
    loadingShows,
    loadingNotFinishedShows,
    loadingMovies,
    handleUserShowsOnClient,
    handleUserMoviesOnClient,
  }
}

export default useUserShows
