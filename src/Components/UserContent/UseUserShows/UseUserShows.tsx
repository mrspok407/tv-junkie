import { useState, useEffect, useContext } from "react"
import { combineMergeObjects } from "Utils"
import { organiseFutureEpisodesByMonth } from "Components/Pages/Calendar/CalendarHelpers"
import { FirebaseContext } from "Components/Firebase"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"
import { ContentDetailes } from "Utils/Interfaces/ContentDetails"
import merge from "deepmerge"
import useGetUserToWatchShows from "./Hooks/UseGetUserToWatchShows"
import getShowsFullInfo from "./FirebaseHelpers/getShowsFullInfo"
import spliceNewShowFromDatabase from "./FirebaseHelpers/spliceNewShowFromDatabase"

const SESSION_STORAGE_KEY_SHOWS = "userShows"

export interface UserShowsInterface extends ContentDetailes {
  allEpisodesWatched: boolean
  database: string
  finished: boolean
  timeStamp: number
  userRating: string | string
  episodes: SeasonEpisodesFromDatabaseInterface[]
  info: {}
}

export interface SingleEpisodeInterface {
  [key: string]: number | string | boolean | null | undefined
  id?: number
  userRating: number
  watched: boolean
  air_date: string | null
  episode_number?: number
  season_number?: number
}
export interface SeasonEpisodesFromDatabaseInterface {
  episodes: SingleEpisodeInterface[]
  air_date?: string
  poster_path?: string
  episode_count?: number
  season_number: number
  userRating: number | string
  name: string
  id: number
}

export interface UserMoviesInterface extends ContentDetailes {
  timeStamp?: number
}

export interface SingleEpisodeByMonthInterface {
  episode_number?: number
  show: string
  air_date: any
  showId: number
}
export interface UserWillAirEpisodesInterface {
  month: string
  episodes: SingleEpisodeByMonthInterface[]
}

const useUserShows = () => {
  const [userShows, setUserShows] = useState<UserShowsInterface[]>([])
  const [userMovies, setUserMovies] = useState<UserMoviesInterface[]>([])
  const [userWillAirEpisodes, setUserWillAirEpisodes] = useState<UserWillAirEpisodesInterface[]>([])
  const {
    userToWatchShows,
    loadingNotFinishedShows,
    listenerUserToWatchShow,
    resetStateToWatchShows
  } = useGetUserToWatchShows()
  const [loadingShows, setLoadingShows] = useState(true)
  const [loadingShowsMerging, setLoadingShowsMerging] = useState(true)
  const [loadingMovies, setLoadingMovies] = useState(true)
  const [firebaseListeners, setFirebaseListeners] = useState<any>([])

  const firebase = useContext(FirebaseContext)

  useEffect(() => {
    let authSubscriber: any
    const authUserListener = () => {
      console.log("hook run")
      authSubscriber = firebase.onAuthUserListener(
        (authUser: AuthUserInterface) => {
          if (!authUser) return
          setLoadingShows(true)
          setLoadingMovies(true)
          firebase
            .userAllShows(authUser.uid)
            .on("value", async (snapshot: { val: () => UserShowsInterface[] }) => {
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
                const { showsFullInfo, willAirEpisodes } = await getShowsFullInfo({
                  userShows: shows,
                  firebase,
                  authUser
                })
                setUserShows(showsFullInfo)
                setUserWillAirEpisodes(willAirEpisodes)
                setLoadingShows(false)
                setLoadingShowsMerging(false)
              } else if (userShowsSS.length < shows.length) {
                shows.forEach(async (show, index) => {
                  if (userShowsSS.find((item) => item.id === show.id)) return

                  const { showsFullInfo, willAirEpisodes } = await spliceNewShowFromDatabase({
                    userShow: show,
                    index,
                    userShowsSS,
                    firebase
                  })
                  setUserShows(showsFullInfo)
                  setUserWillAirEpisodes(willAirEpisodes)
                  setLoadingShows(false)
                })
              } else if (userShowsSS.length === shows.length) {
                console.log("userShows length same")
                const mergedShows = merge(userShowsSS, shows, {
                  arrayMerge: combineMergeObjects
                })

                setUserShows(mergedShows)
              }
            })

          listenerUserToWatchShow()

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
              setUserMovies(movies)
              setLoadingMovies(false)
            })

          setFirebaseListeners([firebase.userAllShows(authUser.uid), firebase.watchLaterMovies(authUser.uid)])
        },
        () => {
          setLoadingShows(false)
          setLoadingMovies(false)
        }
      )
    }

    console.log("updated")

    authUserListener()
    return () => {
      console.log("userShowsHook unmounted")
      authSubscriber()
      firebaseListeners.forEach((listener: any) => {
        listener.off()
      })
    }
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    sessionStorage.setItem(SESSION_STORAGE_KEY_SHOWS, JSON.stringify(userShows))
  }, [userShows])

  const handleUserShowsOnClient = ({ database, id }: { id: number; database: string }) => {
    console.log("updateOnClientTOP")
    const userShowsSS: UserShowsInterface[] = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY_SHOWS)!)
    if (userShowsSS.find((show) => show.id === id) === undefined) return

    const updatedShows = userShowsSS.map((show) => (show.id === id ? { ...show, database } : show))

    const watchingShows = updatedShows.filter((show) => show.database === "watchingShows")
    const willAirEpisodes = organiseFutureEpisodesByMonth(watchingShows)

    setUserShows(updatedShows)
    setUserWillAirEpisodes(willAirEpisodes)

    console.log("upd on client")
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

  const resetContentState = () => {
    setUserShows([])
    setUserMovies([])
    setUserWillAirEpisodes([])
    resetStateToWatchShows()
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
