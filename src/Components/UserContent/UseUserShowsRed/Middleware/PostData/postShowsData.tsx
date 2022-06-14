/* eslint-disable max-len */
import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { postUserShowScheme } from 'Components/Firebase/FirebasePostSchemes'
import { getAuthUidFromState } from 'Components/UserAuth/Session/WithAuthentication/Helpers'
import addShowToFireDatabase from 'Components/UserContent/FirebaseHelpers/addShowFireDatabase'
import getShowEpisodesTMDB from 'Components/UserContent/TmdbAPIHelpers/getShowEpisodesFromAPI'
import { EpisodesTMDB, MainDataTMDB } from 'Utils/@TypesTMDB'
import { formatShowEpisodesForUserDatabase } from 'Utils/FormatTMDBAPIData'
import { ErrorInterface } from 'Utils/Hooks/UseErrors/UseErrors'
import { selectShow, setShowsError } from '../../userShowsSliceRed'

interface HandleDatabaseChange {
  id: number
  database: string
  showDetailesTMDB: MainDataTMDB
  firebase: FirebaseInterface
}

export const updateUserShowStatus =
  ({ id, database, firebase }: HandleDatabaseChange): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    const showFromStore = selectShow(getState(), id)

    const updateUsersWatching = () => {
      if (database === 'watchingShows') return 1
      if (showFromStore.database !== 'watchingShows') return 0
      return -1
    }

    try {
      const updateData = {
        [`allShowsList/${id}/usersWatching`]: firebase.ServerValueIncrement(updateUsersWatching()),
        [`users/${authUid}/content/shows/${id}/database`]: database,
        [`users/${authUid}/content/episodes/${id}/info/database`]: database,
        [`users/${authUid}/content/episodes/${id}/info/isAllWatched_database`]: `${showFromStore.allEpisodesWatched}_${database}`,
      }

      await firebase.database().ref().update(updateData)
    } catch (err) {
      const error = err as ErrorInterface
      dispatch(setShowsError({ message: error.message, errorData: error }))
      throw new Error(error.message)
    }
  }

export const handleNewShowInDatabase =
  ({ id, database, showDetailesTMDB, firebase }: HandleDatabaseChange): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    let updateData = {}
    let episodesFromFireDatabase: EpisodesTMDB[] = []

    try {
      const showFullDataFireDatabase = await firebase.showFullDataFireDatabase(id).once('value')
      const existsInFireDatabase = showFullDataFireDatabase.val() !== null

      if (existsInFireDatabase) {
        episodesFromFireDatabase = showFullDataFireDatabase.val()?.episodes!
      } else {
        const showEpisodesTMDB = await getShowEpisodesTMDB({ id })
        const { snapshot: showDataSnapshot } = await addShowToFireDatabase({
          firebase,
          database,
          showDetailesTMDB,
          showEpisodesTMDB,
        })
        episodesFromFireDatabase = showDataSnapshot.val()?.episodes!
      }
      const showEpisodesUserDatabase = formatShowEpisodesForUserDatabase(episodesFromFireDatabase)
      updateData = postUserShowScheme({
        authUid,
        showDetailesTMDB,
        showEpisodes: showEpisodesUserDatabase,
        showDatabase: database,
        firebase,
      })

      const artificialDelay = new Promise((res: any) => {
        setTimeout(() => res(4), 2000)
      })
      await artificialDelay

      firebase.database().ref().update(updateData)
    } catch (err) {
      const error = err as ErrorInterface
      dispatch(setShowsError({ message: error.message, errorData: error }))
      throw new Error(error.message)
    }
  }
