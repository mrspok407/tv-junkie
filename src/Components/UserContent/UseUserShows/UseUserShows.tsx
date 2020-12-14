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
import updateUserEpisodesFromDatabaseNew from "Components/UserContent/UseUserShows/FirebaseHelpers/updateUserEpisodesFromDatabaseNew"
import * as _transform from "lodash.transform"
import * as _isEqual from "lodash.isequal"
import * as _isObject from "lodash.isobject"

const SESSION_STORAGE_KEY_SHOWS = "userShows"

export interface UserShowsInterface extends ContentDetailes {
  allEpisodesWatched: boolean
  database: string
  finished: boolean
  timeStamp: number
  userRating: string | string
  episodes: SeasonEpisodesFromDatabaseInterface[]
  lastUpdatedInDatabase: number
  lastUpdatedInUser: number
  info: { database: string }
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
  const [firebaseListeners, setFirebaseListeners] = useState<any>([])

  const firebase = useContext(FirebaseContext)

  let count: any = 0

  useEffect(() => {
    let authSubscriber: any
    const authUserListener = () => {
      console.log("hook run")
      authSubscriber = firebase.onAuthUserListener(
        async (authUser: AuthUserInterface) => {
          if (!authUser) return
          setLoadingShows(true)

          updateUserEpisodesFromDatabaseNew({ firebase })

          firebase.userAllShows(authUser.uid).on("value", async (snapshot: { val: () => UserShowsInterface[] }) => {
            if (snapshot.val() === null) {
              console.log("hook in listener NO value")
              setLoadingShows(false)
              return
            }
            console.log("hook in listener")

            count++
            if (count > 20) debugger

            const shows = Object.values(snapshot.val()).map((show) => {
              return show
            })
            const userShowsSS: UserShowsInterface[] = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY_SHOWS)!)

            if (userShowsSS.length === 0) {
              console.log("userShows length = 0")
              listenerUserToWatchShow({ uid: authUser.uid })
              const { showsFullInfo, willAirEpisodes } = await getShowsFullInfo({
                userShows: shows,
                firebase,
                authUser
              })

              setUserShows(showsFullInfo)
              setUserWillAirEpisodes(willAirEpisodes)
              setLoadingShows(false)
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

              const difference = (object: any, base: any) => {
                function changes(object: any, base: any) {
                  return _transform(object, function (result: any, value: any, key: any) {
                    if (!_isEqual(value, base[key])) {
                      result[key] = _isObject(value) && _isObject(base[key]) ? changes(value, base[key]) : value
                    }
                  })
                }
                return changes(object, base)
              }

              const changedShow: any = shows.find((show: any, index: any) => {
                console.log(difference(show, userShowsSS[index]).allEpisodesWatched)
                if (
                  (difference(show, userShowsSS[index]).database ||
                    difference(show, userShowsSS[index]).allEpisodesWatched !== undefined) &&
                  userShowsSS[index].episodes.length === 0
                ) {
                  return show
                }
              })

              console.log({ changedShow })

              if (changedShow) {
                await firebase
                  .showInDatabase(changedShow.id)
                  .once("value")
                  .then((snapshot: { val: () => { info: {}; episodes: SeasonEpisodesFromDatabaseInterface[] } }) => {
                    console.log("call to fire")
                    const index = shows.findIndex((item) => item.id === changedShow.id)
                    const mergedShow = {
                      ...changedShow,
                      ...snapshot.val().info,
                      episodes: snapshot.val().episodes
                    }
                    shows[index] = mergedShow
                  })
              }

              console.log(shows)

              const mergedShows = merge(userShowsSS, shows, {
                arrayMerge: combineMergeObjects
              })

              const watchingShows = mergedShows.filter((show) => show.database === "watchingShows")
              const willAirEpisodes = organiseFutureEpisodesByMonth(watchingShows)

              setUserWillAirEpisodes(willAirEpisodes)
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
    loadingMovies,
    handleUserShowsOnClient,
    handleUserMoviesOnClient,
    resetContentState
  }
}

export default useUserShows
