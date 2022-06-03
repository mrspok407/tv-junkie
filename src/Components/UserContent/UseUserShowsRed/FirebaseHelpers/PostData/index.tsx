import { AppThunk } from 'app/store'
import { EpisodesFromFireDatabase, EpisodesFromUserDatabase } from 'Components/Firebase/@Types'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import addShowFireDatabase from 'Components/UserContent/FirebaseHelpers/addShowFireDatabase'
import getShowEpisodesFromAPI from 'Components/UserContent/TmdbAPIHelpers/getShowEpisodesFromAPI'
import { DataTMDBAPIInterface } from 'Utils/Interfaces/DataTMDBAPIInterface'
import { selectShow, setError } from '../../userShowsSliceRed'

interface HandleDatabaseChange {
  id: number
  database: string
  showDetailes: DataTMDBAPIInterface
  firebase: FirebaseInterface
  uid: string
}

export interface ShowEpisodesTMDB {
  episodes: EpisodesFromFireDatabase[]
  status: string
}

export const handleDatabaseChange =
  ({ id, database, showDetailes, uid, firebase }: HandleDatabaseChange): AppThunk =>
  async (dispatch, getState) => {
    const show = selectShow(getState(), id)

    if (!show) {
      dispatch(handleNewShowInDatabase({ id, database, showDetailes, uid, firebase }))
      return
    }
    if (show.database === database) return

    const updateUsersWatching = () => {
      if (database === 'watchingShows') return 1
      if (show.database !== 'watchingShows') return 0
      return -1
    }

    const updateData = {
      [`allShowsList/${id}/usersWatching`]: firebase.ServerValueIncrement(updateUsersWatching()),
      [`users/${uid}/content/shows/${id}/database`]: database,
      [`users/${uid}/content/episodes/${id}/info/database`]: database,
      [`users/${uid}/content/episodes/${id}/info/isAllWatched_database`]: `${show.allEpisodesWatched}_${database}`,
    }

    try {
      await firebase.database().ref().update(updateData)
    } catch (err) {
      dispatch(setError(err))
    }
  }

export const handleNewShowInDatabase =
  ({ id, database, showDetailes, uid, firebase }: HandleDatabaseChange): AppThunk =>
  async (dispatch) => {
    try {
      // const showFullDataFireDatabase = await firebase.showFullDataFireDatabase(id).once('value')

      const showEpisodesTMDB: ShowEpisodesTMDB = await getShowEpisodesFromAPI({ id })
      const showsSubDatabase =
        showEpisodesTMDB.status === 'Ended' || showEpisodesTMDB.status === 'Canceled' ? 'ended' : 'ongoing'
      const userEpisodes = showEpisodesTMDB.episodes.reduce((acc, season) => {
        const episodes = season.episodes.map((episode) => ({
          watched: false,
          userRating: 0,
          air_date: episode.air_date || '',
        }))

        acc.push({ season_number: season.season_number, episodes, userRating: 0 })
        return acc
      }, [] as EpisodesFromUserDatabase['episodes'])

      const isShowInDatabase = await firebase.showFullDataFireDatabase(id).child('id').once('value')
      if (isShowInDatabase.val() === null) {
        await addShowFireDatabase({ firebase, showDetailes, showEpisodesTMDB })
      }

      const updateData = {
        [`users/${uid}/content/shows/${id}`]: {
          allEpisodesWatched: false,
          database,
          status: showsSubDatabase,
          firstAirDate: showDetailes.first_air_date,
          name: showDetailes.name,
          timeStamp: firebase.timeStamp(),
          finished: false,
          id,
        },
        [`users/${uid}/content/episodes/${id}`]: {
          episodes: userEpisodes,
          info: {
            database,
            allEpisodesWatched: false,
            isAllWatched_database: `false_${database}`,
            finished: false,
          },
        },
        [`users/${uid}/content/showsLastUpdateList/${id}/lastUpdatedInUser`]: firebase.timeStamp(),
        [`allShowsList/${id}/usersWatching`]: firebase.ServerValueIncrement(database === 'watchingShows' ? 1 : 0),
      }

      firebase.database().ref().update(updateData)
    } catch (err) {
      dispatch(setError(err))
    }
  }
