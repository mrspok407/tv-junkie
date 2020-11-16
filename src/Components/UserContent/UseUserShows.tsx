/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useContext } from "react"
import { combineMergeObjects, releasedEpisodesToOneArray } from "Utils"
import { organiseFutureEpisodesByMonth } from "Components/Pages/Calendar/CalendarHelpers"
import merge from "deepmerge"
import updateUserEpisodesFromDatabase from "./FirebaseHelpers/updateUserEpisodesFromDatabase"
import { FirebaseContext } from "Components/Firebase"
import { AuthUserFirebaseInterface } from "Utils/Interfaces/UserAuth"
import { ContentDetailes } from "Utils/Interfaces/ContentDetails"

const SESSION_STORAGE_KEY_SHOWS = "userShows"

interface UserShowsInterface extends ContentDetailes {
  allEpisodesWatched: boolean
  database: string
  finished: boolean
  timeStamp: number
  userRating: string
  episodes: {}[]
}

export interface UserMoviesInterface extends ContentDetailes {
  timeStamp: number
}

export interface UserWillAirEpisodesInterface {
  month: string
  episodes: {}[]
}

export interface UserToWatchShowsInterface {
  id: number
  episodes: {}[]
}

const useUserShows = () => {
  const [userShows, setUserShows] = useState<UserShowsInterface[]>([])
  const [userMovies, setUserMovies] = useState<UserMoviesInterface[]>([])
  const [userWillAirEpisodes, setUserWillAirEpisodes] = useState<UserWillAirEpisodesInterface[]>([])
  const [userToWatchShows, setUserToWatchShows] = useState<UserToWatchShowsInterface[]>([])
  const [loadingShows, setLoadingShows] = useState(true)
  const [loadingNotFinishedShows, setLoadingNotFinishedShows] = useState(true)
  const [loadingShowsMerging, setLoadingShowsMerging] = useState(true)
  const [loadingMovies, setLoadingMovies] = useState(true)
  const [firebaseListeners, setFirebaseListeners] = useState<any>([])

  const firebase = useContext(FirebaseContext)

  const authUserListener = useCallback(() => {
    console.log("hook run")
    firebase.onAuthUserListener(
      (authUser: AuthUserFirebaseInterface) => {
        setLoadingShows(true)
        setLoadingNotFinishedShows(true)
        setLoadingShowsMerging(true)
        setLoadingMovies(true)
        firebase.userAllShows(authUser.uid).on("value", (snapshot: { val: () => UserShowsInterface[] }) => {
          if (snapshot.val() === null) {
            console.log("hook in listener NO value")
            setLoadingShows(false)
            setLoadingShowsMerging(false)
            return
          }

          console.log("hook in listener")

          const shows = Object.values(snapshot.val()).map((show) => {
            return show
          })
          const userShowsSS: UserShowsInterface[] = JSON.parse(
            sessionStorage.getItem(SESSION_STORAGE_KEY_SHOWS)!
          )

          if (userShowsSS.length === 0) {
            console.log("userShows length = 0")
            Promise.all(
              Object.values(snapshot.val()).map((show) => {
                return firebase
                  .showInDatabase(show.id)
                  .once("value")
                  .then((snapshot: any) => {
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
              const mergedShows: UserShowsInterface[] = merge(shows, showsDatabase, {
                arrayMerge: combineMergeObjects
              })

              const watchingShows = mergedShows.filter((show) => show && show.database === "watchingShows")
              const willAirEpisodes: UserWillAirEpisodesInterface[] = organiseFutureEpisodesByMonth(
                watchingShows
              )

              updateUserEpisodesFromDatabase({ firebase, authUser, shows: mergedShows }).then(() =>
                setLoadingShowsMerging(false)
              )
              console.log({ mergedShows })
              console.log({ willAirEpisodes })

              setUserShows(mergedShows)
              setUserWillAirEpisodes(willAirEpisodes)
              setLoadingShows(false)

              return mergedShows
            })
          } else if (userShowsSS.length < shows.length) {
            console.log("userShows length less")
            shows.forEach((show, index) => {
              if (userShowsSS.find((item) => item.id === show.id)) return

              firebase
                .showInDatabase(show.id)
                .once("value", (snapshot: { val: () => { info: {}; episodes: {}[] } }) => {
                  const updatedShows = [...userShowsSS]
                  const mergedShow: UserShowsInterface = {
                    ...show,
                    ...snapshot.val().info,
                    episodes: snapshot.val().episodes
                  }

                  updatedShows.splice(index, 0, mergedShow)

                  const watchingShows = updatedShows.filter((show) => show.database === "watchingShows")
                  const willAirEpisodes: UserWillAirEpisodesInterface[] = organiseFutureEpisodesByMonth(
                    watchingShows
                  )

                  setUserShows(updatedShows)
                  setUserWillAirEpisodes(willAirEpisodes)
                  setLoadingShows(false)
                })
            })
          } else if (userShowsSS.length === shows.length) {
            console.log("userShows length same")
            const mergedShows = merge(userShowsSS, shows, {
              arrayMerge: combineMergeObjects
            })

            setUserShows(mergedShows)
          }
        })

        firebase
          .userEpisodes(authUser.uid)
          .orderByChild("info/isAllWatched_database")
          .equalTo("false_watchingShows")
          .on("value", (snapshot: any) => {
            if (snapshot.val() === null) {
              setUserToWatchShows([])
              setLoadingNotFinishedShows(false)
              return
            }

            const userEpisodes: UserToWatchShowsInterface[] = Object.entries(snapshot.val()).reduce(
              (acc: UserToWatchShowsInterface[], [key, value]: any) => {
                const releasedEpisodes: { watched: boolean }[] = releasedEpisodesToOneArray({
                  data: value.episodes
                })

                if (releasedEpisodes.find((episode) => !episode.watched)) {
                  acc.push({ id: Number(key), episodes: value.episodes })
                }
                return acc
              },
              []
            )

            console.log({ userEpisodes })

            setUserToWatchShows(userEpisodes)
            setLoadingNotFinishedShows(false)
          })

        firebase
          .watchLaterMovies(authUser.uid)
          .on("value", (snapshot: { val: () => UserMoviesInterface[] }) => {
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

        setFirebaseListeners([
          firebase.userAllShows(authUser.uid),
          firebase.watchLaterMovies(authUser.uid),
          firebase
            .userEpisodes(authUser.uid)
            .orderByChild("info/isAllWatched_database")
            .equalTo("false_watchingShows")
        ])
      },
      () => {
        setLoadingShows(false)
        setLoadingMovies(false)
        setLoadingNotFinishedShows(false)
      }
    )
  }, [firebase])

  const resetContentState = () => {
    setUserShows([])
    setUserMovies([])
    setUserWillAirEpisodes([])
    setUserToWatchShows([])
  }

  useEffect(() => {
    authUserListener()
    return () => {
      console.log("userShowsHook unmounted")
      firebaseListeners.forEach((listener: any) => {
        listener.off()
      })
    }
  }, [])

  useEffect(() => {
    sessionStorage.setItem(SESSION_STORAGE_KEY_SHOWS, JSON.stringify(userShows))
  }, [userShows])

  const handleUserShowsOnClient = ({ database, id }: UserShowsInterface) => {
    const userShowsSS: UserShowsInterface[] = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY_SHOWS)!)
    if (userShowsSS.find((show) => show.id === id) === undefined) return

    const updatedShows = userShowsSS.map((show) => (show.id === id ? { ...show, database } : show))

    const watchingShows = updatedShows.filter((show) => show.database === "watchingShows")
    const willAirEpisodes = organiseFutureEpisodesByMonth(watchingShows)

    setUserShows(updatedShows)
    setUserWillAirEpisodes(willAirEpisodes)

    console.log("upd on client")
  }

  const handleUserMoviesOnClient = ({ id }: UserMoviesInterface) => {
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
    handleUserMoviesOnClient,
    resetContentState
  }
}

export default useUserShows
