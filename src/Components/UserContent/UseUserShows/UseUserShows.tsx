import { useState, useEffect, useContext, useReducer } from "react"
import { combineMergeObjects } from "Utils"
import { organiseFutureEpisodesByMonth } from "Components/Pages/Calendar/CalendarHelpers"
import { FirebaseContext } from "Components/Firebase"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"
import { ContentDetailes } from "Utils/Interfaces/ContentDetails"
import merge from "deepmerge"
import useGetUserToWatchShows from "./Hooks/UseGetUserToWatchShows"
import fetchShowsFullData from "./FirebaseHelpers/fetchShowsFullData"
import spliceNewShowFromDatabase from "./FirebaseHelpers/spliceNewShowFromDatabase"
import getFullInfoForUpdatedShow from "./FirebaseHelpers/getFullInfoForUpdatedShow"
import useGetUserMovies from "./Hooks/UseGetUserMovies"
import updateUserEpisodesFromDatabase from "Components/UserContent/UseUserShows/FirebaseHelpers/updateUserEpisodesFromDatabase"
import { useAppDispatch, useAppSelector } from "app/hooks"
import { changeShow, fetchUserShows, opachki, selectUserShows, testSlice, setUserShows } from "./userShowsSlice"
import sortDataSnapshot from "../FirebaseHelpers/sortDataSnapshot"
import { SnapshotVal } from "Components/AppContext/@Types"

const SESSION_STORAGE_KEY_SHOWS = "userShows"

export interface UserShowsInterface extends ContentDetailes {
  allEpisodesWatched: boolean
  database: string
  finished: boolean
  timeStamp: number
  userRating: string | string
  episodes: SeasonEpisodesFromDatabaseInterface[]
  episodesFetched: boolean | undefined
  lastUpdatedInDatabase: number
  lastUpdatedInUser: number
  info: { database: string }
  key: string
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
  const { userToWatchShows, loadingNotFinishedShows, listenerUserToWatchShow, resetStateToWatchShows } =
    useGetUserToWatchShows()

  const { userMovies, loadingMovies, listenerUserMovies, handleUserMoviesOnClient, resetStateUserMovies } =
    useGetUserMovies()
  const [loadingShows, setLoadingShows] = useState(true)
  const [firebaseListeners, setFirebaseListeners] = useState<any>([])

  const firebase = useContext(FirebaseContext)
  const userShowsRedux = useAppSelector(selectUserShows)

  const dispatch = useAppDispatch()

  useEffect(() => {
    console.log(userShowsRedux)
  }, [userShowsRedux])

  useEffect(() => {
    let authSubscriber: any
    const authUserListener = () => {
      authSubscriber = firebase.onAuthUserListener(
        async (authUser: AuthUserInterface) => {
          if (!authUser) return

          await updateUserEpisodesFromDatabase({ firebase })

          try {
            // dispatch(testSlice.actions.testRed("fffffffff"))
            dispatch(fetchUserShows(authUser.uid, firebase))
            // dispatch(opachki("obana"))
            // const promise = Promise.all([

            //   new Promise((res) => setTimeout(res, 1000))
            // ])
            // promise.then((res) => {
            //   console.log({ res })
            //   firebase
            //     .userAllShows(authUser.uid)
            //     .orderByChild("timeStamp")
            //     .on("child_changed", (snapshot: SnapshotVal<UserShowsInterface>) => {
            //       dispatch(changeShow(snapshot.val()))
            //     })
            // })

            // orderByChild(timeSTamp).limitToLast() - просто так последний таймстеп брать и на основе его делать child_added

            // const userShowsSnapshot = await firebase.userAllShows(authUser.uid).orderByChild("timeStamp").once("value")
            // dispatch(updateUserShows(userShowsSnapshot.val()))

            // const userShowsData = sortDataSnapshot<UserShowsInterface>(userShowsSnapshot)
            // console.log(userShowsData[userShowsData.length - 1].timeStamp)
            // firebase
            //   .userAllShows(authUser.uid)
            //   .orderByChild("timeStamp")
            //   .startAfter(userShowsData[userShowsData.length - 1].timeStamp)
            //   .on("child_added", (snapshot: SnapshotVal<UserShowsInterface>) => {
            //     dispatch(addNewShow(snapshot.val()))
            //   })
          } catch (error) {}

          setLoadingShows(true)

          // await updateUserEpisodesFromDatabase({ firebase })

          firebase.userAllShows(authUser.uid).on("value", async (snapshot: SnapshotVal<UserShowsInterface[]>) => {
            if (snapshot.val() === null) {
              setLoadingShows(false)
              return
            }
            setLoadingShows(false)
            // const shows = Object.values(snapshot.val()).map((show) => {
            //   return show
            // })

            // const userShowsSS: UserShowsInterface[] = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY_SHOWS)!)

            // if (userShowsSS.length === 0) {
            //   // listenerUserToWatchShow({ uid: authUser.uid })
            //   const showFullData = await fetchShowsFullData({
            //     userShows: shows,
            //     firebase
            //   })
            //   console.log({ showFullData })
            //   // console.log(showsFullInfo)
            //   // setUserShows(showsFullInfo)
            //   // setUserWillAirEpisodes(willAirEpisodes)
            //   // setLoadingShows(false)
            // } else if (userShowsSS.length < shows.length) {
            //   shows.forEach(async (show, index) => {
            //     if (userShowsSS.find((item) => item.id === show.id)) return

            //     const { showsFullInfo, willAirEpisodes } = await spliceNewShowFromDatabase({
            //       userShow: show,
            //       index,
            //       userShowsSS,
            //       firebase
            //     })
            //     setUserShows(showsFullInfo)
            //     setUserWillAirEpisodes(willAirEpisodes)
            //     setLoadingShows(false)
            //   })
            // } else if (userShowsSS.length === shows.length) {
            //   // const { userShowsCopy } = await getFullInfoForUpdatedShow({ userShows: shows, userShowsSS, firebase })
            //   // const mergedShows = merge(userShowsSS, userShowsCopy, {
            //   //   arrayMerge: combineMergeObjects
            //   // })
            //   // const watchingShows = mergedShows.filter((show) => show.database === "watchingShows")
            //   // const willAirEpisodes = organiseFutureEpisodesByMonth(watchingShows)
            //   // setUserWillAirEpisodes(willAirEpisodes)
            //   // setUserShows(mergedShows)
            // }
          })

          listenerUserMovies({ uid: authUser.uid })

          setFirebaseListeners([firebase.userAllShows(authUser.uid), firebase.watchLaterMovies(authUser.uid)])
        },
        () => {
          authSubscriber()
          firebaseListeners.forEach((listener: any) => {
            listener.off()
          })
          setLoadingShows(false)
        }
      )
    }

    authUserListener()
    return () => {
      authSubscriber()
      firebaseListeners.forEach((listener: any) => {
        listener.off()
      })
    }
    // eslint-disable-next-line
  }, [firebase.auth.currentUser])

  useEffect(() => {
    sessionStorage.setItem(SESSION_STORAGE_KEY_SHOWS, JSON.stringify(userShows))
  }, [userShows])

  const handleUserShowsOnClient = ({ database, id }: { id: number; database: string }) => {
    const userShowsSS: UserShowsInterface[] = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY_SHOWS)!)
    if (userShowsSS.find((show) => show.id === id) === undefined) return

    const updatedShows = userShowsSS.map((show) => (show.id === id ? { ...show, database } : show))

    const watchingShows = updatedShows.filter((show) => show.database === "watchingShows")
    const willAirEpisodes = organiseFutureEpisodesByMonth(watchingShows)

    setUserShows(updatedShows)
    setUserWillAirEpisodes(willAirEpisodes)
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
