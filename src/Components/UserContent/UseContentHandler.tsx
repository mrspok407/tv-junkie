import { useContext, useState } from "react"
import { FirebaseContext } from "Components/Firebase"
import {
  AddShowsToDatabaseOnRegisterArg,
  AddShowToDatabaseArg,
  HandleMovieInDatabasesArg,
  HandleShowInDatabasesArg
} from "Components/AppContext/AppContextHOC"
import addShowToMainDatabase from "./FirebaseHelpers/addShowToMainDatabase"
import getShowEpisodesFromAPI from "./TmdbAPIHelpers/getShowEpisodesFromAPI"
import useAuthUser from "Components/UserAuth/Session/WithAuthentication/UseAuthUser"

export const LOADING_ADDING_TO_DATABASE_INITIAL = {
  watchingShows: false,
  droppedShows: false,
  willWatchShows: false,
  notWatchingShows: false
}

const useContentHandler = () => {
  const [loadingAddShowToDatabase, setLoadingAddShowToDatabase] = useState(LOADING_ADDING_TO_DATABASE_INITIAL)
  const [loadingShowsOnRegister, setLoadingShowsOnRegister] = useState(false)

  const firebase = useContext(FirebaseContext)
  const authUser = useAuthUser()

  const addShowsToDatabaseOnRegister = ({ shows, uid }: AddShowsToDatabaseOnRegisterArg) => {
    // setLoadingShowsOnRegister(true)
    Promise.all(
      Object.values(shows).map((show) => {
        return getShowEpisodesFromAPI({ id: show.id }).then((dataFromAPI: any) => {
          const showsSubDatabase =
            dataFromAPI.status === "Ended" || dataFromAPI.status === "Canceled" ? "ended" : "ongoing"

          const userEpisodes = dataFromAPI.episodes.reduce(
            (acc: {}[], season: { episodes: { air_date: string }[]; season_number: number }) => {
              const episodes = season.episodes.map((episode) => {
                return { watched: false, userRating: 0, air_date: episode.air_date || "" }
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

          addShowToMainDatabase({ firebase, show, dataFromAPI })

          return { showInfo, userEpisodes }
        })
      })
    )
      .then(async (data) => {
        const userShows = data.reduce((acc, show) => {
          const showInfo = { ...show.showInfo }
          return { ...acc, [show.showInfo.id]: showInfo }
        }, {})

        const userEpisodes = data.reduce((acc, show) => {
          const showEpisodes = { ...show.userEpisodes }
          return {
            ...acc,
            [show.showInfo.id]: {
              info: {
                allEpisodesWatched: false,
                finished: false,
                database: "watchingShows",
                isAllWatched_database: `false_watchingShows`
              },
              episodes: showEpisodes
            }
          }
        }, {})

        const userShowsLastUpdateList = data.reduce((acc, show) => {
          return { ...acc, [show.showInfo.id]: { lastUpdatedInUser: show.showInfo.timeStamp } }
        }, {})

        await Promise.all([
          firebase.userAllShows(uid).set(userShows),
          firebase.userEpisodes(uid).set(userEpisodes, () => {
            setLoadingShowsOnRegister(false)
          })
        ])
        firebase.userShowsLastUpdateList(uid).set(userShowsLastUpdateList)

        console.log(userShows)
        console.log(userEpisodes)
      })
      .catch(() => {
        setLoadingShowsOnRegister(false)
      })
  }

  const handleLoadingShowsOnRegister = (isLoading: boolean) => {
    setLoadingShowsOnRegister(isLoading)
  }

  const addShowToDatabase = ({ id, show, database, handleListeners }: AddShowToDatabaseArg) => {
    if (!authUser) {
      setLoadingAddShowToDatabase(LOADING_ADDING_TO_DATABASE_INITIAL)
      return
    }
    getShowEpisodesFromAPI({ id }).then(async (dataFromAPI: any) => {
      console.log("addShowInDatabase run in function body")

      const showsSubDatabase = dataFromAPI.status === "Ended" || dataFromAPI.status === "Canceled" ? "ended" : "ongoing"

      const userEpisodes = dataFromAPI.episodes.reduce(
        (acc: {}[], season: { episodes: { air_date: string }[]; season_number: number }) => {
          const episodes = season.episodes.map((episode) => {
            return { watched: false, userRating: 0, air_date: episode.air_date || "" }
          })

          acc.push({ season_number: season.season_number, episodes, userRating: 0 })
          return acc
        },
        []
      )

      console.log(authUser)

      await addShowToMainDatabase({ firebase, show, dataFromAPI })
      await Promise.all([
        firebase.userAllShows(authUser.uid).child(id).set({
          allEpisodesWatched: false,
          database: database,
          status: showsSubDatabase,
          firstAirDate: show.first_air_date,
          name: show.name,
          timeStamp: firebase.timeStamp(),
          finished: false,
          id
        }),
        firebase
          .userEpisodes(authUser.uid)
          .child(id)
          .set(
            {
              episodes: userEpisodes,
              info: {
                database: database,
                allEpisodesWatched: false,
                isAllWatched_database: `false_${database}`,
                finished: false
              }
            },
            () => {
              setLoadingAddShowToDatabase(LOADING_ADDING_TO_DATABASE_INITIAL)
            }
          )
      ])

      firebase.userShowsLastUpdateList(authUser.uid).child(id).set({
        lastUpdatedInUser: firebase.timeStamp()
      })

      console.log("right after promise all")
      if (handleListeners) handleListeners({ id, status: dataFromAPI.status })
    })
  }

  const handleShowInDatabases = ({ id, data, database, userShows, handleListeners }: HandleShowInDatabasesArg) => {
    if (!authUser) return
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
      setLoadingAddShowToDatabase({ ...loadingAddShowToDatabase, [database]: true })

      const showData: any = Array.isArray(data) ? data.find((item) => item.id === id) : data
      addShowToDatabase({ id, show: showData, database, handleListeners })
    }
  }

  const handleMovieInDatabases = ({ id, data, onRegister, userOnRegister }: HandleMovieInDatabasesArg) => {
    const user = onRegister ? userOnRegister : authUser

    if (!user) return
    console.log("handleMovieINDatabases")

    const movie = data
    firebase
      .watchLaterMovies(user.uid)
      .child(id)
      .once("value", (snapshot: any) => {
        if (snapshot.val() !== null) {
          firebase.watchLaterMovies(user.uid).child(id).set(null)
        } else {
          firebase.watchLaterMovies(user.uid).child(id).set({
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
    handleMovieInDatabases,
    handleLoadingShowsOnRegister,
    loadingAddShowToDatabase,
    loadingShowsOnRegister
  }
}

export default useContentHandler