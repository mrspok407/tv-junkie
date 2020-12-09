import React, { createContext } from "react"
import useUserContentLocalStorage from "Components/UserContent/UseUserContentLocalStorage"
import useUserShows, {
  UserMoviesInterface,
  UserShowsInterface,
  UserWillAirEpisodesInterface
} from "Components/UserContent/UseUserShows/UseUserShows"
import useContentHandler, { LOADING_ADDING_TO_DATABASE_INITIAL } from "Components/UserContent/UseContentHandler"
import useFirebase from "Components/Firebase/UseFirebase"
import useAuthUser from "Components/UserAuth/Session/WithAuthentication/UseAuthUser"
import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"
import { ContentDetailes } from "Utils/Interfaces/ContentDetails"
import { UserToWatchShowsInterface } from "Components/UserContent/UseUserShows/Hooks/UseGetUserToWatchShows"
import { HandleListenersArg } from "Components/Pages/Detailes/FirebaseHelpers/UseHandleListeners"

export interface ShowInterface {
  id: number
  backdrop_path: string
  first_air_date: string
  genre_ids: number[]
  name: string
  original_name: string
  overview: string
  poster_path: string
  vote_average: string | number
  vote_count: string | number
  allEpisodesWatched: boolean
  database: string
  finished: boolean
}

export interface MovieInterface {
  id: number
  title: string
  release_date: string
  vote_average: string | number
  vote_count: string | number
  backdrop_path: string
  overview: string
  genre_ids: number[]
}

export interface AddShowsToDatabaseOnRegisterArg {
  shows: ContentDetailes[]
  uid: string
}

export interface AddShowToDatabaseArg {
  id: number
  show: ContentDetailes
  database: string
  handleListeners?: ({ id, status, handleLoading }: HandleListenersArg) => void
}

export interface HandleShowInDatabasesArg {
  id: number
  data: ContentDetailes
  database: string
  userShows: ContentDetailes[]
  handleListeners?: ({ id, status, handleLoading }: HandleListenersArg) => void
}

export interface HandleMovieInDatabasesArg {
  id: number
  data: MovieInterface
  onRegister?: boolean
  userOnRegister?: { email: string; uid: string; displayName: string }
}

export interface ToggleMovieLSArg {
  id: number
  data: ContentDetailes[] | ContentDetailes
}

export interface AppContextInterface {
  userContentLocalStorage: {
    watchLaterMovies: ContentDetailes[]
    watchingShows: ContentDetailes[]
    toggleMovieLS: ({ id, data }: ToggleMovieLSArg) => void
    clearContentState: () => void
    addShowLS: ({ id, data }: { id: number; data: ContentDetailes }) => void
    removeShowLS: ({ id }: { id: number }) => void
  }
  userContent: {
    loadingShowsMerging: boolean
    loadingShows: boolean
    loadingNotFinishedShows: boolean
    loadingMovies: boolean
    userShows: UserShowsInterface[]
    userWillAirEpisodes: UserWillAirEpisodesInterface[]
    userToWatchShows: UserToWatchShowsInterface[]
    userMovies: ContentDetailes[]
    resetContentState: () => void
    handleUserMoviesOnClient: ({ id, data }: { id: number; data?: UserMoviesInterface }) => void
    handleUserShowsOnClient: ({ id, database }: { id: number; database: string }) => void
  }
  userContentHandler: {
    addShowsToDatabaseOnRegister: ({ shows }: AddShowsToDatabaseOnRegisterArg) => void
    addShowToDatabase: ({ id, show, handleListeners }: AddShowToDatabaseArg) => void
    handleShowInDatabases: ({ id, data, database, userShows }: HandleShowInDatabasesArg) => void
    handleMovieInDatabases: ({ id, data }: HandleMovieInDatabasesArg) => void
    handleLoadingShowsOnRegister: (isLoading: boolean) => void
    loadingAddShowToDatabase: {
      watchingShows: boolean
      droppedShows: boolean
      willWatchShows: boolean
      notWatchingShows: boolean
    }
    loadingShowsOnRegister: boolean
  }
  firebase: FirebaseInterface
  authUser: AuthUserInterface | null
}

export const CONTEXT_INITIAL_STATE = {
  userContentLocalStorage: {
    watchLaterMovies: [],
    watchingShows: [],
    toggleMovieLS: () => {},
    clearContentState: () => {},
    addShowLS: () => {},
    removeShowLS: () => {}
  },
  userContent: {
    loadingShowsMerging: true,
    loadingShows: true,
    loadingNotFinishedShows: true,
    loadingMovies: true,
    userShows: [],
    userWillAirEpisodes: [],
    userToWatchShows: [],
    userMovies: [],
    resetContentState: () => {},
    handleUserMoviesOnClient: () => {},
    handleUserShowsOnClient: () => {}
  },
  userContentHandler: {
    addShowsToDatabaseOnRegister: () => {},
    addShowToDatabase: () => {},
    handleShowInDatabases: () => {},
    handleMovieInDatabases: () => {},
    handleLoadingShowsOnRegister: () => {},
    loadingAddShowToDatabase: LOADING_ADDING_TO_DATABASE_INITIAL,
    loadingShowsOnRegister: false
  },
  firebase: {},
  authUser: { uid: "", email: "", emailVerified: false }
}

export const AppContext = createContext<AppContextInterface>(CONTEXT_INITIAL_STATE)

const AppContextHOC = (Component: any) =>
  function Comp(props: any) {
    const ContextValue: AppContextInterface = {
      userContentLocalStorage: useUserContentLocalStorage(),
      userContent: useUserShows(),
      userContentHandler: useContentHandler(),
      firebase: useFirebase(),
      authUser: useAuthUser()
    }
    return (
      <AppContext.Provider value={ContextValue}>
        <Component {...props} />
      </AppContext.Provider>
    )
  }

export default AppContextHOC

// import React, { useCallback, useContext, useEffect, useState } from "react"
// import { Link } from "react-router-dom"
// import ShowsEpisodes from "Components/UI/Templates/SeasonsAndEpisodes/ShowsEpisodes"
// import { todayDate, combineMergeObjects, releasedEpisodesToOneArray } from "Utils"
// import Loader from "Components/UI/Placeholders/Loader"
// import PlaceholderNoToWatchEpisodes from "Components/UI/Placeholders/PlaceholderNoToWatchEpisodes"
// import merge from "deepmerge"
// import { AppContext } from "Components/AppContext/AppContextHOC"
// import {
//   SeasonEpisodesFromDatabaseInterface,
//   SingleEpisodeInterface,
//   UserShowsInterface
// } from "Components/UserContent/UseUserShows/UseUserShows"

// const ToWatchEpisodesContent: React.FC = () => {
//   const [watchingShows, setWatchingShows] = useState<UserShowsInterface[]>([])
//   const [initialLoading, setInitialLoading] = useState(true)

//   const context = useContext(AppContext)

//   const getContent = useCallback(() => {
//     const watchingShows = context.userContent.userShows.filter(
//       (show) => show.database === "watchingShows" && !show.allEpisodesWatched
//     )
//     const toWatchEpisodes: any = context.userContent.userToWatchShows

//     if (toWatchEpisodes.length === 0) {
//       setWatchingShows([])
//       if (!context.userContent.loadingNotFinishedShows && !context.userContent.loadingShows) {
//         setInitialLoading(false)
//       }
//       return
//     }

//     console.log({ watchingShows })
//     console.log({ toWatchEpisodes })

//     const watchingShowsModified = watchingShows
//       .reduce((acc: UserShowsInterface[], show) => {
//         const showToWatch = toWatchEpisodes.find((item: any) => item.id === show.id)
//         if (showToWatch) {
//           const showMerged = merge(showToWatch, show, {
//             arrayMerge: combineMergeObjects
//           })
//           console.log({ showToWatch })
//           acc.push(showMerged)
//         }
//         return acc
//       }, [])
//       .sort((a, b) => (a.first_air_date > b.first_air_date ? -1 : 1))

//     console.log({ watchingShowsModified })

//     // const mergedShows = merge(watchingShowsModified, toWatchEpisodes, {
//     //   arrayMerge: combineMergeObjects
//     // }).sort((a, b) => (a.first_air_date > b.first_air_date ? -1 : 1))

//     setWatchingShows(watchingShowsModified)
//     setInitialLoading(false)
//   }, [context.userContent])

//   useEffect(() => {
//     getContent()
//   }, [getContent])

//   return (
//     <div className="content-results content-results--to-watch-page">
//       {initialLoading || context.userContent.loadingShowsMerging ? (
//         <Loader className="loader--pink" />
//       ) : watchingShows.length === 0 ? (
//         <PlaceholderNoToWatchEpisodes />
//       ) : (
//         <>
//           {watchingShows.map((show) => {
//             const toWatchEpisodes = show.episodes.reduce(
//               (acc: SeasonEpisodesFromDatabaseInterface[], season) => {
//                 const seasonEpisodes = season.episodes.reduce((acc: SingleEpisodeInterface[], episode) => {
//                   if (episode.air_date && new Date(episode.air_date).getTime() < todayDate.getTime()) {
//                     acc.push(episode)
//                   }
//                   return acc
//                 }, [])

//                 seasonEpisodes.reverse()

//                 if (seasonEpisodes.length !== 0 && seasonEpisodes.some((item) => !item.watched)) {
//                   acc.push({ ...season, episodes: seasonEpisodes })
//                 }

//                 return acc
//               },
//               []
//             )
//             toWatchEpisodes.reverse()

//             const releasedEpisodes: SingleEpisodeInterface[] = releasedEpisodesToOneArray({
//               data: toWatchEpisodes
//             })
//             return (
//               <div key={show.id} className="towatch__show">
//                 <Link className="towatch__show-name" to={`/show/${show.id}`}>
//                   {show.name}
//                 </Link>
//                 <ShowsEpisodes
//                   parentComponent="toWatchPage"
//                   episodesData={toWatchEpisodes}
//                   showTitle={show.name || show.original_name}
//                   id={show.id}
//                   showInfo={show}
//                   episodesFromDatabase={show.episodes}
//                   releasedEpisodes={releasedEpisodes}
//                 />
//               </div>
//             )
//           })}
//         </>
//       )}
//     </div>
//   )
// }

// export default ToWatchEpisodesContent
