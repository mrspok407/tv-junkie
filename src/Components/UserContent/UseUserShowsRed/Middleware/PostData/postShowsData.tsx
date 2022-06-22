/* eslint-disable max-len */
import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { postUserShowScheme, updateUserShowStatusScheme } from 'Components/Firebase/FirebasePostSchemes/PostSchemes'
import { getAuthUidFromState } from 'Components/UserAuth/Session/WithAuthentication/Helpers'
import { EpisodesTMDB, MainDataTMDB } from 'Utils/@TypesTMDB'
import { formatShowEpisodesForUserDatabase } from 'Utils/FormatTMDBAPIData'
import { handleShowsError } from '../../ErrorHandlers/handleShowsError'
import postShowFireDatabase from '../../FirebaseHelpers/PostData/postShowFireDatabase'
import { changeUserShowStatus, selectShow, selectShowEpisodes } from '../../userShowsSliceRed'

interface HandleDatabaseChange {
  id: number
  database: string
  showDetailesTMDB: MainDataTMDB
  firebase: FirebaseInterface
}

export const updateUserShowStatus =
  ({ id, database: userShowStatus, firebase }: HandleDatabaseChange): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    const showFromStore = selectShow(getState(), id)

    const allStateBefore = getState()

    const episodesBefore = selectShowEpisodes(getState(), id)

    console.log({ showFromStoreBeforeOU: showFromStore })

    dispatch(changeUserShowStatus({ id, userShowStatus }))

    const showFromStoreNewVar = selectShow(getState(), id)
    const episodesAfter = selectShowEpisodes(getState(), id)

    const allStateAfter = getState()

    console.log({ isAllEpisodesEqual: episodesBefore === episodesAfter })
    console.log({ isAllStateEqual: allStateBefore === allStateAfter })
    console.log({ isArrEqual: showFromStore.genre_ids === showFromStoreNewVar.genre_ids })
    console.log({ isInfoEqual: showFromStore === showFromStoreNewVar })
    console.log({
      showFromStoreAfterOU: showFromStore,
      showFromStoreNewVarAfterOU: showFromStoreNewVar,
    })
    // debugger

    try {
      const updateData = updateUserShowStatusScheme({ authUid, id, userShowStatus, showFromStore, firebase })
      await firebase.database().ref().update(updateData)
    } catch (err) {
      console.log({ showFromStoreError: showFromStore.database })
      // dispatch(changeUserShowStatus({ id, userShowStatus }))
      dispatch(handleShowsError(err))
    }
  }

export const handleNewShowInDatabase =
  ({ id, database, showDetailesTMDB, firebase }: HandleDatabaseChange): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    let episodesFromFireDatabase: EpisodesTMDB[] = []

    try {
      const showFullDataFireDatabase = await firebase.showFullDataFireDatabase(id).once('value')
      const existsInFireDatabase = showFullDataFireDatabase.val() !== null

      if (existsInFireDatabase) {
        episodesFromFireDatabase = showFullDataFireDatabase.val()?.episodes!
      } else {
        const showDataSnapshot = await postShowFireDatabase({ firebase, database, showDetailesTMDB })
        episodesFromFireDatabase = showDataSnapshot?.episodes!
      }

      const showEpisodesUserDatabase = formatShowEpisodesForUserDatabase(episodesFromFireDatabase)
      const updateData = postUserShowScheme({
        authUid,
        showDetailesTMDB,
        showEpisodes: showEpisodesUserDatabase,
        showDatabase: database,
        firebase,
      })

      firebase.database().ref().update(updateData)
    } catch (err) {
      dispatch(handleShowsError(err))
    }
  }
