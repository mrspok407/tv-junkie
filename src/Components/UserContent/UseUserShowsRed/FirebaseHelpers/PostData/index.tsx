/* eslint-disable max-len */
import { AppThunk } from 'app/store'
import { EpisodesFromUserDatabase } from 'Components/Firebase/@Types'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { getAuthUidFromState } from 'Components/UserAuth/Session/WithAuthentication/Helpers'
import addShowToFireDatabase from 'Components/UserContent/FirebaseHelpers/addShowFireDatabase'
import getShowEpisodesTMDB from 'Components/UserContent/TmdbAPIHelpers/getShowEpisodesFromAPI'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { selectShow, setError } from '../../userShowsSliceRed'

interface HandleDatabaseChange {
  id: number
  userShowStatus: string
  showDetailesTMDB: MainDataTMDB
  firebase: FirebaseInterface
}

export const handleDatabaseChange =
  ({ id, userShowStatus, showDetailesTMDB, firebase }: HandleDatabaseChange): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    const showStore = selectShow(getState(), id)

    console.log({ showDetailesTMDB })

    if (!showStore) {
      dispatch(handleNewShowInDatabase({ id, userShowStatus, showDetailesTMDB, firebase }))
      return
    }
    if (showStore.userShowStatus === userShowStatus) return

    const updateUsersWatching = () => {
      if (userShowStatus === 'watchingShows') return 1
      if (showStore.userShowStatus !== 'watchingShows') return 0
      return -1
    }

    const updateData = {
      [`allShowsList/${id}/usersWatching`]: firebase.ServerValueIncrement(updateUsersWatching()),
      [`users/${authUid}/content/shows/${id}/database`]: userShowStatus,
      [`users/${authUid}/content/episodes/${id}/info/database`]: userShowStatus,
      [`users/${authUid}/content/episodes/${id}/info/isAllWatched_database`]: `${showStore.allEpisodesWatched}_${userShowStatus}`,
    }

    try {
      await firebase.database().ref().update(updateData)
    } catch (err) {
      dispatch(setError(err))
    }
  }

export const handleNewShowInDatabase =
  ({ id, userShowStatus, showDetailesTMDB, firebase }: HandleDatabaseChange): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())

    try {
      const showFullDataFireDatabase = await firebase.showFullDataFireDatabase(id).once('value')

      const showEpisodesTMDB = await getShowEpisodesTMDB({ id })
      console.log({ showEpisodesTMDB, showDetailesTMDB })
      await addShowToFireDatabase({ firebase, userShowStatus, showDetailesTMDB, showEpisodesTMDB })

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
        await addShowToFireDatabase({ firebase, userShowStatus, showDetailesTMDB, showEpisodesTMDB })
      }

      const updateData = {
        [`users/${authUid}/content/shows/${id}`]: {
          allEpisodesWatched: false,
          database: userShowStatus,
          status: showsSubDatabase,
          firstAirDate: showDetailesTMDB.first_air_date,
          name: showDetailesTMDB.name,
          timeStamp: firebase.timeStamp(),
          finished: false,
          id,
        },
        [`users/${authUid}/content/episodes/${id}`]: {
          episodes: userEpisodes,
          info: {
            database: userShowStatus,
            allEpisodesWatched: false,
            isAllWatched_database: `false_${userShowStatus}`,
            finished: false,
          },
        },
        [`users/${authUid}/content/showsLastUpdateList/${id}/lastUpdatedInUser`]: firebase.timeStamp(),
        [`allShowsList/${id}/usersWatching`]: firebase.ServerValueIncrement(userShowStatus === 'watchingShows' ? 1 : 0),
      }

      firebase.database().ref().update(updateData)
    } catch (err) {
      dispatch(setError(err))
    }
  }
