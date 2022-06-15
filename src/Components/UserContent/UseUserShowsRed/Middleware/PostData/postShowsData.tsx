/* eslint-disable max-len */
import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { postUserShowScheme, updateUserShowStatusScheme } from 'Components/Firebase/FirebasePostSchemes/PostSchemes'
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
  ({ id, database: userShowStatus, firebase }: HandleDatabaseChange): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    const showFromStore = selectShow(getState(), id)

    try {
      const updateData = updateUserShowStatusScheme({ authUid, id, userShowStatus, showFromStore, firebase })
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
      const updateData = postUserShowScheme({
        authUid,
        showDetailesTMDB,
        showEpisodes: showEpisodesUserDatabase,
        showDatabase: database,
        firebase,
      })

      firebase.database().ref().update(updateData)
    } catch (err) {
      const error = err as ErrorInterface
      dispatch(setShowsError({ message: error.message, errorData: error }))
      throw new Error(error.message)
    }
  }
