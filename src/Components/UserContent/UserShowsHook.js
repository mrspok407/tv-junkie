/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react"
import { combineMergeObjects, releasedEpisodesToOneArray } from "Utils"
import { organiseFutureEpisodesByMonth } from "Components/CalendarPage/CalendarHelpers"
import merge from "deepmerge"
import updateUserEpisodesFromDatabase from "./FirebaseHelpers/updateUserEpisodesFromDatabase"

const SESSION_STORAGE_KEY_SHOWS = "userShows"

const useUserShows = (firebase) => {
  const [userShows, setUserShows] = useState([])
  const [userMovies, setUserMovies] = useState([])
  const [userWillAirEpisodes, setUserWillAirEpisodes] = useState([])
  const [userToWatchShows, setUserToWatchShows] = useState([])
  const [loadingShows, setLoadingShows] = useState(true)
  const [loadingNotFinishedShows, setLoadingNotFinishedShows] = useState(true)
  const [loadingShowsMerging, setLoadingShowsMerging] = useState(true)
  const [loadingMovies, setLoadingMovies] = useState(true)
  const [firebaseListeners, setFirebaseListeners] = useState([])

  const authUserListener = useCallback(() => {
    console.log("hook run")
    firebase.onAuthUserListener(
      (authUser) => {
        firebase.userAllShows(authUser.uid).on("value", (snapshot) => {
          if (snapshot.val() === null) {
            console.log("hook in listener NO value")
            setLoadingShows(false)
            return
          }

          console.log("hook in listener")

          const shows = Object.values(snapshot.val()).map((show) => {
            return show
          })
          const userShowsSS = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY_SHOWS))
          const userShowsSSLength = userShowsSS.length

          if (userShowsSSLength === 0) {
            Promise.all(
              Object.values(snapshot.val()).map((show) => {
                return firebase
                  .showInDatabase(show.id)
                  .once("value")
                  .then((snapshot) => {
                    if (snapshot.val() !== null) {
                      return {
                        ...show,
                        ...snapshot.val().info,
                        episodes: snapshot.val().episodes || []
                      }
                    }
                  })
              })
            ).then((showsDatabase) => {
              const mergedShows = merge(shows, showsDatabase, {
                arrayMerge: combineMergeObjects
              })

              const watchingShows = mergedShows.filter((show) => show && show.database === "watchingShows")
              const willAirEpisodes = organiseFutureEpisodesByMonth(watchingShows)

              updateUserEpisodesFromDatabase({ firebase, authUser, shows: mergedShows }).then(() =>
                setLoadingShowsMerging(false)
              )

              setUserShows(mergedShows)
              setUserWillAirEpisodes(willAirEpisodes)
              setLoadingShows(false)

              return mergedShows
            })
          } else if (userShowsSSLength < shows.length) {
            shows.forEach((show, index) => {
              if (userShowsSS.find((item) => item.id === show.id)) return

              firebase.showInDatabase(show.id).once("value", (snapshot) => {
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
              arrayMerge: combineMergeObjects
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

          console.log(userEpisodes)

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
            firebase.watchLaterMovies(authUser.uid)
          ])
        })
      },
      () => {
        console.log("test")
        setLoadingShows(false)
        setLoadingMovies(false)
      }
    )
  }, [firebase])

  useEffect(() => {
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
    loadingShowsMerging,
    loadingMovies,
    handleUserShowsOnClient,
    handleUserMoviesOnClient
  }
}

export default useUserShows
