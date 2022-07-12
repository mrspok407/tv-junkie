import { AppThunk } from 'app/store'
import { ShowInfoFromUserDatabase } from 'Components/Firebase/@TypesFirebase'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import {
  postUserShowScheme,
  updateUserShowStatusScheme,
} from 'Components/Firebase/FirebasePostSchemes/Post/ContentSchemes'
import { getAuthUidFromState } from 'Components/UserAuth/Session/Authentication/Helpers'
import { batch } from 'react-redux'
import { artificialAsyncDelay } from 'Utils'
import { EpisodesTMDB, MainDataTMDB } from 'Utils/@TypesTMDB'
import { formatShowEpisodesForUserDatabase } from 'Utils/FormatTMDBAPIData'
import { UserShowStatuses } from '../../@Types'
import { handleShowsError } from '../../ErrorHandlers/handleShowsError'
import postShowFireDatabase from '../../FirebaseHelpers/PostData/postShowFireDatabase'
import { optimisticChangeUserShowStatus } from '../../OptimisticHandlers'
import { selectShow, updateLoadingNewShow } from '../../userShowsSliceRed'
import { handleNewShow } from '../HandleData/handleShowsData'

interface HandleDatabaseChange {
  id: number
  database: UserShowStatuses
  showUserDatabase?: ShowInfoFromUserDatabase | null
  firebase: FirebaseInterface
}

interface HandleNewShow extends HandleDatabaseChange {
  showDetailesTMDB: MainDataTMDB
}

export const updateUserShowStatus =
  ({ id, database: userShowStatus, showUserDatabase, firebase }: HandleDatabaseChange): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    const showFromStore = selectShow(getState(), id)

    try {
      let updateData = {}
      console.log({ showFromStore })
      if (showFromStore) {
        dispatch(optimisticChangeUserShowStatus({ id, userShowStatus }))
        updateData = updateUserShowStatusScheme({ authUid, id, userShowStatus, showFromStore, firebase })
      } else {
        if (userShowStatus === showUserDatabase?.database) {
          dispatch(handleNewShow(showUserDatabase, firebase))
          return
        }
        updateData = updateUserShowStatusScheme({ authUid, id, userShowStatus, showUserDatabase, firebase })
      }

      // await artificialAsyncDelay(2500)
      console.log({ updateData })
      return firebase.rootRef().update(updateData)
    } catch (err) {
      console.log({ errThunk: err })
      batch(() => {
        dispatch(optimisticChangeUserShowStatus({ id, userShowStatus: showFromStore.database }))
        dispatch(handleShowsError(err))
      })
    }
  }

export const handleNewShowInDatabase =
  ({ id, database, showDetailesTMDB, firebase }: HandleNewShow): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    let episodesFromFireDatabase: EpisodesTMDB[] = []

    dispatch(updateLoadingNewShow(database))
    try {
      const [showFullDataFireDatabase, showUserDatabase] = await Promise.all([
        firebase.showFullDataFireDatabase(id).once('value'),
        firebase.userShow({ authUid, key: id }).once('value'),
      ])
      const existsInFireDatabase = showFullDataFireDatabase.val() !== null

      if (existsInFireDatabase) {
        episodesFromFireDatabase = showFullDataFireDatabase.val()?.episodes!
      } else {
        const showDataSnapshot = await postShowFireDatabase({ firebase, database, showDetailesTMDB })
        episodesFromFireDatabase = showDataSnapshot?.episodes!
      }

      // await artificialAsyncDelay(2500)
      console.log({ showUserDatabase: showUserDatabase.val() })
      if (showUserDatabase.val() === null) {
        const showEpisodesUserDatabase = formatShowEpisodesForUserDatabase(episodesFromFireDatabase)
        const updateData = postUserShowScheme({
          authUid,
          showDetailesTMDB,
          showEpisodes: showEpisodesUserDatabase,
          showDatabase: database,
          firebase,
        })

        return firebase.rootRef().update(updateData)
      } else {
        return dispatch(updateUserShowStatus({ id, database, showUserDatabase: showUserDatabase.val(), firebase }))
      }
    } catch (err) {
      dispatch(handleShowsError(err))
    }
  }
