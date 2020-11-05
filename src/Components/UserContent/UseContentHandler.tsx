import React, { useState, useContext } from "react"
import { FirebaseContext, withFirebase } from "Components/Firebase"
import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import {
  AddShowsToDatabaseOnRegisterArg,
  AddShowToDatabaseArg,
  HandleMovieInDatabasesArg,
  HandleShowInDatabasesArg
} from "Components/AppContext/AppContextHOC"
import addShowToMainDatabase from "./FirebaseHelpers/addShowToMainDatabase"
import getShowEpisodesFromAPI from "./TmdbAPIHelpers/getShowEpisodesFromAPI"
import { AuthUserContext } from "Components/UserAuth/Session/WithAuthentication"

// interface Show {
//   id: number
//   backdrop_path: string
//   first_air_date: string
//   genre_ids: number[]
//   name: string
//   original_name: string
//   overview: string
//   poster_path: string
//   vote_average: string | number
//   vote_count: string | number
//   allEpisodesWatched: boolean
//   database: string
// }

// interface Movie {
//   id: number | string
//   title: string
//   release_date: string
//   vote_average: string | number
//   vote_count: string | number
//   backdrop_path: string
//   overview: string
//   genre_ids: number[]
// }

// interface AddShowsToDatabaseOnRegisterArg {
//   shows: Show[]
// }

// interface AddShowToDatabaseArg {
//   id: number
//   show: Show
//   callback?: () => void
// }

// interface HandleShowInDatabasesArg {
//   id: number
//   data: Show[]
//   database: string
//   userShows: Show[]
//   callback?: () => void
// }

const useContentHandler = () => {
  const [error, setError] = useState<{ error: boolean; message: string }>()
  const authUser: { uid: string } = useContext(AuthUserContext)
  const firebase: FirebaseInterface = useContext(FirebaseContext)

  const addShowsToDatabaseOnRegister = ({ shows }: AddShowsToDatabaseOnRegisterArg) => {
    Promise.all(
      Object.values(shows).map((show) => {
        return getShowEpisodesFromAPI({ id: show.id }).then((dataFromAPI: any) => {
          const showsSubDatabase =
            dataFromAPI.status === "Ended" || dataFromAPI.status === "Canceled" ? "ended" : "ongoing"

          const userEpisodes = dataFromAPI.episodes.reduce(
            (acc: {}[], season: { episodes: {}[]; season_number: number }) => {
              const episodes = season.episodes.map(() => {
                return { watched: false, userRating: 0 }
              })

              acc.push({ season_number: season.season_number, episodes, userRating: 0 })
              return acc
            },
            []
          )

          const showInfo = {
            allEpisodesWatched: false,
            finished: false,
            database: "watchingShows",
            status: showsSubDatabase,
            firstAirDate: show.first_air_date,
            name: show.name,
            timeStamp: firebase.timeStamp(),
            id: show.id
          }

          addShowToMainDatabase({
            firebase,
            show,
            dataFromAPI
          })

          return { showInfo, userEpisodes }
        })
      })
    ).then((data) => {
      const userShows = data.reduce((acc, show) => {
        const showInfo = { ...show.showInfo }
        return { ...acc, [show.showInfo.id]: showInfo }
      }, {})

      const userEpisodes = data.reduce((acc, show) => {
        const showEpisodes = { ...show.userEpisodes }
        return {
          ...acc,
          [show.showInfo.id]: {
            info: { allEpisodesWatched: false, finished: false, database: "watchingShows" },
            episodes: showEpisodes
          }
        }
      }, {})

      firebase.auth.onAuthStateChanged((auth: { uid: string }) => {
        console.log(auth)
        if (!auth) return

        firebase.userAllShows(auth.uid).set(userShows)
        firebase.userEpisodes(auth.uid).set(userEpisodes)
      })

      console.log(userShows)
      console.log(userEpisodes)
    })
  }

  const addShowToDatabase = ({ id, show, callback }: AddShowToDatabaseArg) => {
    getShowEpisodesFromAPI({ id }).then((dataFromAPI: any) => {
      console.log("addShowInDatabase run in function body")

      const showsSubDatabase =
        dataFromAPI.status === "Ended" || dataFromAPI.status === "Canceled" ? "ended" : "ongoing"

      const userEpisodes = dataFromAPI.episodes.reduce(
        (acc: {}[], season: { episodes: { air_date: string }[]; season_number: number }) => {
          const episodes = season.episodes.map((episode) => {
            return { watched: false, userRating: 0, air_date: episode.air_date || null }
          })

          acc.push({ season_number: season.season_number, episodes, userRating: 0 })
          return acc
        },
        []
      )

      console.log(authUser)

      firebase.auth.onAuthStateChanged((auth: { uid: string }) => {
        console.log(auth)
        if (!auth) return

        firebase.userAllShows(auth.uid).child(id).set({
          database: "watchingShows",
          status: showsSubDatabase,
          firstAirDate: show.first_air_date,
          name: show.name,
          timeStamp: firebase.timeStamp(),
          finished: false,
          id
        })

        firebase
          .userEpisodes(auth.uid)
          .child(id)
          .set({
            episodes: userEpisodes,
            info: {
              database: "watchingShows",
              allEpisodesWatched: false,
              isAllWatched_database: "false_watchingShows",
              finished: false
            }
          })
      })

      addShowToMainDatabase({
        firebase,
        show,
        dataFromAPI,
        callback
      })
    })
  }

  const handleShowInDatabases = ({
    id,
    data = [],
    database,
    userShows,
    callback
  }: HandleShowInDatabasesArg) => {
    const userShow = userShows.find((show) => show.id === id)

    if (userShow) {
      firebase.userShow({ uid: authUser.uid, key: id }).update({
        database
      })

      firebase
        .userShowAllEpisodesInfo(authUser.uid, id)
        .update({
          database,
          isAllWatched_database: `${userShow.allEpisodesWatched}_${database}`
        })
        .catch((error: any) => {
          console.log(`Error in database occured. ${error}`)

          setError({
            error: true,
            message: `Error in database occured. ${error}`
          })
        })

      firebase
        .showInDatabase(id)
        .child("usersWatching")
        .once("value", (snapshot: any) => {
          const currentUsersWatching = snapshot.val()
          const prevDatabase = userShow.database

          firebase.showInDatabase(id).update({
            usersWatching:
              database === "watchingShows"
                ? currentUsersWatching + 1
                : prevDatabase !== "watchingShows"
                ? currentUsersWatching
                : currentUsersWatching - 1
          })
        })
    } else {
      const showData: any = Array.isArray(data) ? data.find((item) => item.id === id) : data
      addShowToDatabase({ id, show: showData, callback })
    }
  }

  const handleMovieInDatabases = ({ id, data }: HandleMovieInDatabasesArg) => {
    const movie: any = Array.isArray(data) ? data.find((item) => item.id === id) : {}

    firebase
      .watchLaterMovies(authUser.uid)
      .child(id)
      .once("value", (snapshot: any) => {
        if (snapshot.val() !== null) {
          firebase.watchLaterMovies(authUser.uid).child(id).set(null)
        } else {
          firebase.watchLaterMovies(authUser.uid).child(id).set({
            id: movie.id,
            title: movie.title,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            vote_count: movie.vote_count,
            backdrop_path: movie.backdrop_path,
            overview: movie.overview,
            genre_ids: movie.genre_ids,
            timeStamp: firebase.timeStamp()
          })
        }
      })
  }

  return {
    addShowsToDatabaseOnRegister,
    addShowToDatabase,
    handleShowInDatabases,
    handleMovieInDatabases
  }
}

// const userContentHandler = (Component: any) => {
//   class UserContentHandler extends React.Component<Props, State> {
//     firebase = this.props.firebase
//     authUser = this.props.authUser
//     userUid = this.authUser && this.authUser.uid

//     state: State = {
//       errorInDatabase: {
//         error: false,
//         message: ""
//       }
//     }

//     componentDidUpdate(prevProps: Props) {
//       if (!!this.props.authUser && this.props.authUser !== prevProps.authUser) {
//         this.authUser = this.props.authUser
//         this.userUid = this.props.authUser.uid
//       }
//     }

//     addShowsToDatabaseOnRegister = ({ shows }: AddShowsToDatabaseOnRegisterArg) => {
//       Promise.all(
//         Object.values(shows).map((show) => {
//           return getShowEpisodesFromAPI({ id: show.id }).then((dataFromAPI: any) => {
//             const showsSubDatabase =
//               dataFromAPI.status === "Ended" || dataFromAPI.status === "Canceled" ? "ended" : "ongoing"

//             const userEpisodes = dataFromAPI.episodes.reduce(
//               (acc: {}[], season: { episodes: {}[]; season_number: number }) => {
//                 const episodes = season.episodes.map(() => {
//                   return { watched: false, userRating: 0 }
//                 })

//                 acc.push({ season_number: season.season_number, episodes, userRating: 0 })
//                 return acc
//               },
//               []
//             )

//             const showInfo = {
//               allEpisodesWatched: false,
//               finished: false,
//               database: "watchingShows",
//               status: showsSubDatabase,
//               firstAirDate: show.first_air_date,
//               name: show.name,
//               timeStamp: this.firebase.timeStamp(),
//               id: show.id
//             }

//             addShowToMainDatabase({
//               firebase: this.firebase,
//               show,
//               dataFromAPI
//             })

//             return { showInfo, userEpisodes }
//           })
//         })
//       ).then((data) => {
//         const userShows = data.reduce((acc, show) => {
//           const showInfo = { ...show.showInfo }
//           return { ...acc, [show.showInfo.id]: showInfo }
//         }, {})

//         const userEpisodes = data.reduce((acc, show) => {
//           const showEpisodes = { ...show.userEpisodes }
//           return {
//             ...acc,
//             [show.showInfo.id]: {
//               info: { allEpisodesWatched: false, finished: false, database: "watchingShows" },
//               episodes: showEpisodes
//             }
//           }
//         }, {})

//         this.firebase.auth.onAuthStateChanged((auth: { uid: string }) => {
//           console.log(auth)
//           if (!auth) return

//           this.firebase.userAllShows(auth.uid).set(userShows)
//           this.firebase.userEpisodes(auth.uid).set(userEpisodes)
//         })

//         console.log(userShows)
//         console.log(userEpisodes)
//       })
//     }

//     addShowToDatabase = ({ id, show, callback }: AddShowToDatabaseArg) => {
//       getShowEpisodesFromAPI({ id }).then((dataFromAPI: any) => {
//         console.log("addShowInDatabase run in function body")

//         const showsSubDatabase =
//           dataFromAPI.status === "Ended" || dataFromAPI.status === "Canceled" ? "ended" : "ongoing"

//         const userEpisodes = dataFromAPI.episodes.reduce(
//           (acc: {}[], season: { episodes: { air_date: string }[]; season_number: number }) => {
//             const episodes = season.episodes.map((episode) => {
//               return { watched: false, userRating: 0, air_date: episode.air_date || null }
//             })

//             acc.push({ season_number: season.season_number, episodes, userRating: 0 })
//             return acc
//           },
//           []
//         )

//         console.log(this.authUser)

//         this.firebase.auth.onAuthStateChanged((auth: { uid: string }) => {
//           console.log(auth)
//           if (!auth) return

//           this.firebase.userAllShows(auth.uid).child(id).set({
//             database: "watchingShows",
//             status: showsSubDatabase,
//             firstAirDate: show.first_air_date,
//             name: show.name,
//             timeStamp: this.firebase.timeStamp(),
//             finished: false,
//             id
//           })

//           this.props.firebase
//             .userEpisodes(auth.uid)
//             .child(id)
//             .set({
//               episodes: userEpisodes,
//               info: {
//                 database: "watchingShows",
//                 allEpisodesWatched: false,
//                 isAllWatched_database: "false_watchingShows",
//                 finished: false
//               }
//             })
//         })

//         addShowToMainDatabase({
//           firebase: this.firebase,
//           show,
//           dataFromAPI,
//           callback
//         })
//       })
//     }

//     handleShowInDatabases = ({ id, data = [], database, userShows, callback }: HandleShowInDatabasesArg) => {
//       const userShow = userShows.find((show) => show.id === id)

//       if (userShow) {
//         this.firebase.userShow({ uid: this.userUid, key: id }).update({
//           database
//         })

//         this.props.firebase
//           .userShowAllEpisodesInfo(this.userUid, id)
//           .update({
//             database,
//             isAllWatched_database: `${userShow.allEpisodesWatched}_${database}`
//           })
//           .catch((error: any) => {
//             console.log(`Error in database occured. ${error}`)

//             this.setState({
//               errorInDatabase: {
//                 error: true,
//                 message: `Error in database occured. ${error}`
//               }
//             })
//           })

//         this.firebase
//           .showInDatabase(id)
//           .child("usersWatching")
//           .once("value", (snapshot: any) => {
//             const currentUsersWatching = snapshot.val()
//             const prevDatabase = userShow.database

//             this.firebase.showInDatabase(id).update({
//               usersWatching:
//                 database === "watchingShows"
//                   ? currentUsersWatching + 1
//                   : prevDatabase !== "watchingShows"
//                   ? currentUsersWatching
//                   : currentUsersWatching - 1
//             })
//           })
//       } else {
//         const showData: any = Array.isArray(data) ? data.find((item) => item.id === id) : data
//         this.addShowToDatabase({ id, show: showData, callback })
//       }
//     }

//     handleMovieInDatabases = ({ id, data = [] }: { id: number; data: Movie[] }) => {
//       const movie: any = Array.isArray(data) ? data.find((item) => item.id === id) : {}

//       this.firebase
//         .watchLaterMovies(this.userUid)
//         .child(id)
//         .once("value", (snapshot: any) => {
//           if (snapshot.val() !== null) {
//             this.firebase.watchLaterMovies(this.userUid).child(id).set(null)
//           } else {
//             this.firebase.watchLaterMovies(this.userUid).child(id).set({
//               id: movie.id,
//               title: movie.title,
//               release_date: movie.release_date,
//               vote_average: movie.vote_average,
//               vote_count: movie.vote_count,
//               backdrop_path: movie.backdrop_path,
//               overview: movie.overview,
//               genre_ids: movie.genre_ids,
//               timeStamp: this.firebase.timeStamp()
//             })
//           }
//         })
//     }

//     render() {
//       return (
//         <Component
//           {...this.props}
//           handleMovieInDatabases={this.handleMovieInDatabases}
//           handleShowInDatabases={this.handleShowInDatabases}
//           addShowToDatabase={this.addShowToDatabase}
//           addShowsToDatabaseOnRegister={this.addShowsToDatabaseOnRegister}
//         />
//       )
//     }
//   }
//   UserContentHandler.contextType = AppContext
//   return withFirebase(withAuthenticationConsumer(UserContentHandler))
// }

export default useContentHandler
