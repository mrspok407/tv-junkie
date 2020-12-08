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
import useGetUserMovies from "./Hooks/UseGetUserMovies"

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
  name?: string
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
  const [userWillAirEpisodes, setUserWillAirEpisodes] = useState<UserWillAirEpisodesInterface[]>([])
  const {
    userToWatchShows,
    loadingNotFinishedShows,
    listenerUserToWatchShow,
    resetStateToWatchShows
  } = useGetUserToWatchShows()

  const {
    userMovies,
    loadingMovies,
    listenerUserMovies,
    handleUserMoviesOnClient,
    resetStateUserMovies
  } = useGetUserMovies()
  const [loadingShows, setLoadingShows] = useState(true)
  const [loadingShowsMerging, setLoadingShowsMerging] = useState(true)
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

          firebase.userAllShows(authUser.uid).on("value", async (snapshot: { val: () => UserShowsInterface[] }) => {
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
            const userShowsSS: UserShowsInterface[] = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY_SHOWS)!)

            if (userShowsSS.length === 0) {
              console.log("userShows length = 0")
              const { showsFullInfo, willAirEpisodes } = await getShowsFullInfo({
                userShows: shows,
                firebase,
                authUser
              })
              listenerUserToWatchShow({ uid: authUser.uid })

              setUserShows(showsFullInfo)
              setUserWillAirEpisodes(willAirEpisodes)
              setLoadingShows(false)
              setLoadingShowsMerging(false)
            } else if (userShowsSS.length < shows.length) {
              console.log("userShows length < 0")
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

          // listenerUserToWatchShow({ uid: authUser.uid })
          listenerUserMovies({ uid: authUser.uid })

          setFirebaseListeners([firebase.userAllShows(authUser.uid), firebase.watchLaterMovies(authUser.uid)])
        },
        () => {
          setLoadingShows(false)
        }
      )
    }

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
    console.log("userShows updated")
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

  const resetContentState = () => {
    setUserShows([])
    setUserWillAirEpisodes([])
    resetStateUserMovies()
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
