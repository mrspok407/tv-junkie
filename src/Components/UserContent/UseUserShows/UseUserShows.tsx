/* eslint-disable import/no-cycle */
import { useState, useEffect, useContext } from 'react'
import { FirebaseContext } from 'Components/Firebase'
import { AuthUserInterface } from 'Components/UserAuth/Session/WithAuthentication/@Types'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import useGetUserToWatchShows from './Hooks/UseGetUserToWatchShows'
import useGetUserMovies from './Hooks/UseGetUserMovies'

export interface UserShowsInterface extends MainDataTMDB {
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

export interface UserMoviesInterface extends MainDataTMDB {
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
  const { userToWatchShows, loadingNotFinishedShows, resetStateToWatchShows } = useGetUserToWatchShows()

  const { userMovies, loadingMovies, handleUserMoviesOnClient, resetStateUserMovies } = useGetUserMovies()
  const [loadingShows, setLoadingShows] = useState(true)

  const firebase = useContext(FirebaseContext)
  // const userShowsRedux = useAppSelector(selectUserShows)

  // useEffect(() => {
  //   console.log(userShowsRedux)
  // }, [userShowsRedux])

  useEffect(() => {
    let authSubscriber: any
    const authUserListener = () => {
      authSubscriber = firebase.onAuthUserListener(
        async (authUser: AuthUserInterface['authUser']) => {
          if (!authUser?.uid) return

          // await updateUserEpisodesFromDatabase({ firebase })

          setLoadingShows(false)

          // await updateUserEpisodesFromDatabase({ firebase })

          // firebase.userAllShows(authUser.uid).on("value", async (snapshot: SnapshotVal<UserShowsInterface[]>) => {
          //   if (snapshot.val() === null) {
          //     setLoadingShows(false)
          //     return
          //   }
          //   setLoadingShows(false)
          //   const shows = Object.values(snapshot.val()).map((show) => {
          //     return show
          //   })

          //   const userShowsSS: UserShowsInterface[] = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY_SHOWS)!)

          //   if (userShowsSS.length === 0) {
          //     listenerUserToWatchShow({ uid: authUser.uid })
          //     const showFullData = await fetchShowsFullData({
          //       userShows: shows,
          //       firebase
          //     })
          //     console.log({ showFullData })
          //     // console.log(showsFullInfo)
          //     setUserShows(showFullData)
          //     //setUserWillAirEpisodes(willAirEpisodes)
          //     setLoadingShows(false)
          //   } else if (userShowsSS.length < shows.length) {
          //     shows.forEach(async (show, index) => {
          //       if (userShowsSS.find((item) => item.id === show.id)) return

          //       const { showsFullInfo, willAirEpisodes } = await spliceNewShowFromDatabase({
          //         userShow: show,
          //         index,
          //         userShowsSS,
          //         firebase
          //       })
          //       setUserShows(showsFullInfo)
          //       setUserWillAirEpisodes(willAirEpisodes)
          //       setLoadingShows(false)
          //     })
          //   } else if (userShowsSS.length === shows.length) {
          //     const { userShowsCopy } = await getFullInfoForUpdatedShow({ userShows: shows, userShowsSS, firebase })
          //     const mergedShows = merge(userShowsSS, userShowsCopy, {
          //       arrayMerge: combineMergeObjects
          //     })
          //     const watchingShows = mergedShows.filter((show) => show.database === "watchingShows")
          //     const willAirEpisodes = organiseFutureEpisodesByMonth(watchingShows)
          //     setUserWillAirEpisodes(willAirEpisodes)
          //     setUserShows(mergedShows)
          //   }
          // })

          // listenerUserMovies({ uid: authUser.uid })

          // setFirebaseListeners([firebase.userAllShows(authUser.uid), firebase.watchLaterMovies(authUser.uid)])
        },
        () => {
          authSubscriber()
          setLoadingShows(false)
        },
      )
    }

    authUserListener()
    return () => {
      authSubscriber()
    }
    // eslint-disable-next-line
  }, [firebase.auth.currentUser])

  // const handleUserShowsOnClient = ({ database, id }: { id: number; database: string }) => {
  //   const userShowsSS: UserShowsInterface[] = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY_SHOWS)!)
  //   if (userShowsSS.find((show) => show.id === id) === undefined) return

  //   const updatedShows = userShowsSS.map((show) => (show.id === id ? { ...show, database } : show))

  //   const watchingShows = updatedShows.filter((show) => show.database === "watchingShows")
  //   const willAirEpisodes = organiseFutureEpisodesByMonth(watchingShows)

  //   setUserShows(updatedShows)
  //   setUserWillAirEpisodes(willAirEpisodes)
  // }

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
    handleUserMoviesOnClient,
    resetContentState,
  }
}

export default useUserShows
