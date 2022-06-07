/* eslint-disable max-len */
import { AppThunk } from 'app/store'
import { EpisodesFromUserDatabase } from 'Components/Firebase/@TypesFirebase'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { postUserShowScheme } from 'Components/Firebase/FirebasePostSchemes'
import { getAuthUidFromState } from 'Components/UserAuth/Session/WithAuthentication/Helpers'
import addShowToFireDatabase from 'Components/UserContent/FirebaseHelpers/addShowFireDatabase'
import getShowEpisodesTMDB from 'Components/UserContent/TmdbAPIHelpers/getShowEpisodesFromAPI'
import { EpisodesTMDB, MainDataTMDB } from 'Utils/@TypesTMDB'
import { formatShowEpisodesForUserDatabase } from 'Utils/FormatTMDBAPIData'
import { selectShow, setError } from '../../userShowsSliceRed'

interface HandleDatabaseChange {
  id: number
  database: string
  showDetailesTMDB: MainDataTMDB
  firebase: FirebaseInterface
}

export const handleDatabaseChange =
  ({ id, database, showDetailesTMDB, firebase }: HandleDatabaseChange): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    const showStore = selectShow(getState(), id)

    if (!showStore) {
      dispatch(handleNewShowInDatabase({ id, database, showDetailesTMDB, firebase }))
      return
    }
    if (showStore.database === database) return

    const updateUsersWatching = () => {
      if (database === 'watchingShows') return 1
      if (showStore.database !== 'watchingShows') return 0
      return -1
    }

    const updateData = {
      [`allShowsList/${id}/usersWatching`]: firebase.ServerValueIncrement(updateUsersWatching()),
      [`users/${authUid}/content/shows/${id}/database`]: database,
      [`users/${authUid}/content/episodes/${id}/info/database`]: database,
      [`users/${authUid}/content/episodes/${id}/info/isAllWatched_database`]: `${showStore.allEpisodesWatched}_${database}`,
    }

    try {
      await firebase.database().ref().update(updateData)
    } catch (err) {
      dispatch(setError(err))
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
      dispatch(setError(err))
    }
  }
