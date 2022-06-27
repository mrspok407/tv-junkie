import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { postUserShowScheme, updateUserShowStatusScheme } from 'Components/Firebase/FirebasePostSchemes/PostSchemes'
import { getAuthUidFromState } from 'Components/UserAuth/Session/WithAuthentication/Helpers'
import { batch } from 'react-redux'
import { artificialAsyncDelay } from 'Utils'
import { EpisodesTMDB, MainDataTMDB } from 'Utils/@TypesTMDB'
import { formatShowEpisodesForUserDatabase } from 'Utils/FormatTMDBAPIData'
import { UserShowStatuses } from '../../@Types'
import { handleShowsError } from '../../ErrorHandlers/handleShowsError'
import postShowFireDatabase from '../../FirebaseHelpers/PostData/postShowFireDatabase'
import { optimisticChangeUserShowStatus } from '../../OptimisticHandlers'
import { selectShow, updateLoadingNewShow } from '../../userShowsSliceRed'

interface HandleDatabaseChange {
  id: number
  database: UserShowStatuses
  showDetailesTMDB: MainDataTMDB
  firebase: FirebaseInterface
}

export const updateUserShowStatus =
  ({ id, database: userShowStatus, firebase }: HandleDatabaseChange): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    const showFromStore = selectShow(getState(), id)

    try {
      dispatch(optimisticChangeUserShowStatus({ id, userShowStatus }))

      const updateData = updateUserShowStatusScheme({ authUid, id, userShowStatus, showFromStore, firebase })
      return firebase.rootRef().update(updateData)
    } catch (err) {
      batch(() => {
        dispatch(optimisticChangeUserShowStatus({ id, userShowStatus: showFromStore.database }))
        dispatch(handleShowsError(err))
      })
    }
  }

export const handleNewShowInDatabase =
  ({ id, database, showDetailesTMDB, firebase }: HandleDatabaseChange): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    let episodesFromFireDatabase: EpisodesTMDB[] = []

    dispatch(updateLoadingNewShow(database))
    try {
      const showFullDataFireDatabase = await firebase.showFullDataFireDatabase(id).once('value')
      const existsInFireDatabase = showFullDataFireDatabase.val() !== null

      if (existsInFireDatabase) {
        episodesFromFireDatabase = showFullDataFireDatabase.val()?.episodes!
      } else {
        const showDataSnapshot = await postShowFireDatabase({ firebase, database, showDetailesTMDB })
        episodesFromFireDatabase = showDataSnapshot?.episodes!
      }

      await artificialAsyncDelay(2500)

      const showEpisodesUserDatabase = formatShowEpisodesForUserDatabase(episodesFromFireDatabase)
      const updateData = postUserShowScheme({
        authUid,
        showDetailesTMDB,
        showEpisodes: showEpisodesUserDatabase,
        showDatabase: database,
        firebase,
      })

      return firebase.rootRef().update(updateData)
    } catch (err) {
      dispatch(handleShowsError(err))
    }
  }
