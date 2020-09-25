import { useState, useEffect, useCallback } from "react"
import { combineMergeObjects } from "Utils"
import { organiseFutureEpisodesByMonth } from "Components/CalendarPage/CalendarHelpers"
import { releasedEpisodesModifier } from "Utils"
import merge from "deepmerge"

const SESSION_STORAGE_KEY_SHOWS = "userShows"

const useUserShows = firebase => {
  const [userShows, setUserShows] = useState([])
  const [userMovies, setUserMovies] = useState([])
  const [userWillAirEpisodes, setUserWillAirEpisodes] = useState([])
  const [userToWatchShows, setUserToWatchShows] = useState([])
  const [loadingShows, setLoadingShows] = useState(true)
  const [loadingNotFinishedShows, setLoadingNotFinishedShows] = useState(true)
  const [loadingMovies, setLoadingMovies] = useState(true)

  const authUserListener = useCallback(() => {
    firebase.onAuthUserListener(
      authUser => {
        console.log("function run")
        firebase.userAllShows(authUser.uid).on("value", snapshot => {
          if (snapshot.val() === null) {
            setLoadingShows(false)
            return
          }

          console.log("listener on All User Shows")

          const shows = Object.values(snapshot.val()).map(show => {
            return show
          })
          const userShowsSS = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY_SHOWS))
          const userShowsSSLength = userShowsSS.length

          if (userShowsSSLength === 0) {
            Promise.all(
              Object.values(snapshot.val()).map(show => {
                return firebase
                  .showInDatabase(show.status, show.id)
                  .once("value")
                  .then(snapshot => {
                    return {
                      ...show,
                      ...snapshot.val().info,
                      episodes: snapshot.val().episodes
                    }
                  })
              })
            ).then(showsDatabase => {
              const mergedShows = merge(shows, showsDatabase, {
                arrayMerge: combineMergeObjects
              })

              const watchingShows = mergedShows.filter(show => show.database === "watchingShows")

              const willAirEpisodes = organiseFutureEpisodesByMonth(watchingShows)

              setUserShows(mergedShows)
              setUserWillAirEpisodes(willAirEpisodes)
              setLoadingShows(false)
            })
          } else if (userShowsSSLength < shows.length) {
            shows.forEach((show, index) => {
              if (userShowsSS.find(item => item.id === show.id)) return

              firebase.showInDatabase(show.status, show.id).once("value", snapshot => {
                const updatedShows = [...userShowsSS]
                const mergedShow = { ...show, ...snapshot.val().info, episodes: snapshot.val().episodes }

                updatedShows.splice(index, 0, mergedShow)
                const willAirEpisodes = organiseFutureEpisodesByMonth(updatedShows)

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

        firebase.userEpisodesNotFinished(authUser.uid).on("value", snapshot => {
          if (snapshot.val() === null) {
            setLoadingNotFinishedShows(false)
            return
          }

          console.log("not finished episodes ON")

          // const userEpisodesObj = snapshot.val()

          const userEpisodes = Object.values(snapshot.val()).map(show => show)
          console.log(userEpisodes)

          Object.entries(snapshot.val()).forEach(([key, value]) => {
            const releasedEpisodes = releasedEpisodesModifier({ data: value.episodes })
            const allEpisodesWatched = !releasedEpisodes.some(episode => !episode.watched)

            if (allEpisodesWatched) {
              console.log("all watched")

              firebase
                .userShow({ uid: authUser.uid, key })
                .child("status")
                .once("value", snapshot => {
                  const status = snapshot.val()
                  const finished = status === "ended" && allEpisodesWatched ? true : false

                  firebase.userShowAllEpisodesInfo(authUser.uid, key).update({
                    allEpisodesWatched,
                    finished
                  })

                  firebase.userShow({ uid: authUser.uid, key }).update({ finished, allEpisodesWatched })
                  firebase.userShowAllEpisodesNotFinished(authUser.uid, key).set(null)

                  // delete userEpisodesObj[key]
                  // const userEpisodes = Object.values(userEpisodesObj).map(show => show)

                  // setUserToWatchShows(userEpisodes)
                })
            } else {
              // console.log("not watched all")
              // setUserToWatchShows(userEpisodes)
              // setLoadingNotFinishedShows(false)
            }
          })

          setUserToWatchShows(userEpisodes)
          setLoadingNotFinishedShows(false)
        })

        firebase.watchLaterMovies(authUser.uid).on("value", snapshot => {
          if (snapshot.val() === null) {
            setLoadingMovies(false)
            return
          }

          const movies = Object.values(snapshot.val()).map(movie => {
            return movie
          })

          setUserMovies(movies)
          setLoadingMovies(false)
        })
      },
      () => {
        setLoadingShows(false)
        setLoadingMovies(false)
        console.log("user is not logged in")
      }
    )
  }, [firebase])

  useEffect(() => {
    console.log("userShowsHook mounted")
    authUserListener()
    return () => {
      authUserListener()
    }
  }, [authUserListener])

  useEffect(() => {
    sessionStorage.setItem(SESSION_STORAGE_KEY_SHOWS, JSON.stringify(userShows))
    console.log("comp updated")
  }, [userShows])

  const handleUserShowsOnClient = ({ database, id }) => {
    const userShowsSS = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY_SHOWS))
    if (userShowsSS.find(show => show.id === id) === undefined) return

    const updatedShows = userShowsSS.map(show => (show.id === id ? { ...show, database } : show))

    const watchingShows = updatedShows.filter(show => show.database === "watchingShows")
    console.log(watchingShows)
    const willAirEpisodes = organiseFutureEpisodesByMonth(watchingShows)

    setUserShows(updatedShows)
    setUserWillAirEpisodes(willAirEpisodes)

    console.log("upd on client")
  }

  const handleUserMoviesOnClient = ({ id }) => {
    const updatedMovies = userMovies.filter(movie => movie.id !== id)

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
    handleUserMoviesOnClient
  }
}

export default useUserShows
