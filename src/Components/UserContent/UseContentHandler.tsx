import { useState } from 'react'
import {
  AddShowsToDatabaseOnRegisterArg,
  AddShowToDatabaseArg,
  HandleMovieInDatabasesArg,
  HandleShowInDatabasesArg,
} from 'Components/AppContext/@Types'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import addShowFireDatabase from './FirebaseHelpers/addShowFireDatabase'
import getShowEpisodesFromAPI from './TmdbAPIHelpers/getShowEpisodesFromAPI'
import updateAllEpisodesWatched from './UseUserShowsRed/FirebaseHelpers/updateAllEpisodesWatched'

export const LOADING_ADDING_TO_DATABASE_INITIAL = {
  watchingShows: false,
  droppedShows: false,
  willWatchShows: false,
  notWatchingShows: false,
  loading: false,
}

const useContentHandler = () => {
  const { firebase, authUser } = useFrequentVariables()

  const [loadingAddShowToDatabase, setLoadingAddShowToDatabase] = useState(LOADING_ADDING_TO_DATABASE_INITIAL)
  const [loadingShowsOnRegister, setLoadingShowsOnRegister] = useState(false)

  const addShowsToDatabaseOnRegister = ({ shows, uid }: AddShowsToDatabaseOnRegisterArg) => {
    Promise.all(
      Object.values(shows).map((show) =>
        getShowEpisodesFromAPI({ id: show.id }).then((dataFromAPI: any) => {
          const showsSubDatabase =
            dataFromAPI.status === 'Ended' || dataFromAPI.status === 'Canceled' ? 'ended' : 'ongoing'

          const userEpisodes = dataFromAPI.episodes.reduce(
            (acc: {}[], season: { episodes: { air_date: string }[]; season_number: number }) => {
              const episodes = season.episodes.map((episode) => ({
                watched: false,
                userRating: 0,
                air_date: episode.air_date || '',
              }))

              acc.push({ season_number: season.season_number, episodes, userRating: 0 })
              return acc
            },
            [],
          )

          const showInfo = {
            allEpisodesWatched: false,
            finished: false,
            database: 'watchingShows',
            status: showsSubDatabase,
            firstAirDate: show.first_air_date,
            name: show.name,
            timeStamp: firebase.timeStamp(),
            id: show.id,
          }

          addShowFireDatabase({ firebase, showDetailes: show, showEpisodesTMDB: dataFromAPI })

          return { showInfo, userEpisodes }
        }),
      ),
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
                database: 'watchingShows',
                isAllWatched_database: 'false_watchingShows',
              },
              episodes: showEpisodes,
            },
          }
        }, {})

        const userShowsLastUpdateList = data.reduce(
          (acc, show) => ({ ...acc, [show.showInfo.id]: { lastUpdatedInUser: show.showInfo.timeStamp } }),
          {},
        )

        await Promise.all([
          firebase.userAllShows(uid).set(userShows),
          firebase.userEpisodes(uid).set(userEpisodes, () => {
            setLoadingShowsOnRegister(false)
          }),
        ])
        firebase.userShowsLastUpdateList(uid).set(userShowsLastUpdateList)
      })
      .catch(() => {
        setLoadingShowsOnRegister(false)
      })
  }

  const handleLoadingShowsOnRegister = (isLoading: boolean) => {
    setLoadingShowsOnRegister(isLoading)
  }

  const addShowToDatabase = ({ id, show, database, handleListeners }: AddShowToDatabaseArg) => {
    if (!authUser?.uid) {
      setLoadingAddShowToDatabase(LOADING_ADDING_TO_DATABASE_INITIAL)
      return
    }
    getShowEpisodesFromAPI({ id }).then(async (showEpisodesTMDB: any) => {
      const showsSubDatabase =
        showEpisodesTMDB.status === 'Ended' || showEpisodesTMDB.status === 'Canceled' ? 'ended' : 'ongoing'

      const userEpisodes = showEpisodesTMDB.episodes.reduce(
        (acc: {}[], season: { episodes: { air_date: string }[]; season_number: number }) => {
          const episodes = season.episodes.map((episode) => ({
            watched: false,
            userRating: 0,
            air_date: episode.air_date || '',
          }))

          acc.push({ season_number: season.season_number, episodes, userRating: 0 })
          return acc
        },
        [],
      )

      await addShowFireDatabase({ firebase, showDetailes: show, showEpisodesTMDB })
      await Promise.all([
        firebase.userAllShows(authUser.uid).child(id).set({
          allEpisodesWatched: false,
          database,
          status: showsSubDatabase,
          firstAirDate: show.first_air_date,
          name: show.name,
          timeStamp: firebase.timeStamp(),
          finished: false,
          id,
        }),
        firebase
          .userEpisodes(authUser.uid)
          .child(id)
          .set(
            {
              episodes: userEpisodes,
              info: {
                database,
                allEpisodesWatched: false,
                isAllWatched_database: `false_${database}`,
                finished: false,
              },
            },
            () => {
              setLoadingAddShowToDatabase(LOADING_ADDING_TO_DATABASE_INITIAL)
            },
          ),
      ])

      firebase.userShowsLastUpdateList(authUser.uid).child(id).set({
        lastUpdatedInUser: firebase.timeStamp(),
      })

      if (handleListeners) handleListeners({ id, status: showEpisodesTMDB.status })
    })
  }

  const handleShowInDatabases = ({ id, data, database, userShows, handleListeners }: HandleShowInDatabasesArg) => {
    if (!authUser?.uid) return
    const userShow = userShows.find((show) => show.id === id)

    if (userShow) {
      firebase.userShow({ uid: authUser.uid, key: id }).update({
        database,
      })

      firebase
        .userShowAllEpisodesInfo(authUser.uid, id)
        .update(
          {
            database,
            isAllWatched_database: `${userShow.DATA_TMDBAPI_INITIAL}_${database}`,
          },
          () => {
            if (database === 'watchingShows') updateAllEpisodesWatched({ firebase, authUser, key: id })
          },
        )
        .catch((error: any) => {
          console.log(`Error in database occured. ${error}`)
        })

      firebase
        .showFullData(id)
        .child('usersWatching')
        .once('value', (snapshot: any) => {
          const currentUsersWatching = snapshot.val()
          const prevDatabase = userShow.database

          firebase.showFullData(id).update({
            usersWatching:
              database === 'watchingShows'
                ? currentUsersWatching + 1
                : prevDatabase !== 'watchingShows'
                ? currentUsersWatching
                : currentUsersWatching - 1,
          })
        })
    } else {
      if (loadingAddShowToDatabase.loading) return
      setLoadingAddShowToDatabase({ ...loadingAddShowToDatabase, loading: true, [database]: true })

      const showData: any = Array.isArray(data) ? data.find((item) => item.id === id) : data
      addShowToDatabase({ id, show: showData, database, handleListeners })
    }
  }

  const handleMovieInDatabases = ({ id, data, onRegister, userOnRegister }: HandleMovieInDatabasesArg) => {
    const user = onRegister ? userOnRegister : authUser

    if (!user) return
    const movie = data
    firebase
      .watchLaterMovies(user.uid)
      .child(id)
      .once('value', (snapshot: any) => {
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
            timeStamp: firebase.timeStamp(),
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
    loadingShowsOnRegister,
  }
}

export default useContentHandler
