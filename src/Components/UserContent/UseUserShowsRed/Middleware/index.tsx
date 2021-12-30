import { AppThunk } from "app/store"
import { SnapshotVal } from "Components/AppContext/@Types"
import sortDataSnapshot from "../../FirebaseHelpers/sortDataSnapshot"
import { SeasonEpisodesFromDatabaseInterface, UserShowsInterface } from "../@Types"
import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import fetchShowsFullData from "../FirebaseHelpers/fetchShowsFullData"
import { merge } from "lodash"
import { combineMergeObjects } from "Utils"
import { userShowsListeners } from "./firebaseListeners"
import {
  addNewShow,
  changeShow,
  selectShow,
  selectShowEpisodes,
  setError,
  setShowEpisodes,
  setUserShows
} from "../userShowsSliceRed"
import { fetchEpisodesFullData } from "../FirebaseHelpers"

export const fetchUserShows =
  (uid: string, firebase: FirebaseInterface): AppThunk =>
  async (dispatch) => {
    try {
      const userShowsSnapshot = await firebase.userAllShows(uid).orderByChild("timeStamp").once("value")
      const userShows = sortDataSnapshot<UserShowsInterface>(userShowsSnapshot)
      const showsFullData = await fetchShowsFullData({ userShows, firebase, uid })
      const mergedShows: UserShowsInterface[] = merge(showsFullData, userShows, {
        arrayMerge: combineMergeObjects
      })

      dispatch(setUserShows(mergedShows))
      dispatch(userShowsListeners({ uid, firebase }))
    } catch (err) {
      dispatch(setError(err))
    }
  }

export const fetchShowEpisodes =
  (id: number, uid: string, firebase: FirebaseInterface): AppThunk =>
  async (dispatch, getState) => {
    if (!selectShow(getState(), id)) return
    if (selectShowEpisodes(getState(), id).length) {
      console.log("fetchShowEpisodes earlyReturn")
      return
    }
    try {
      const episodes = await fetchEpisodesFullData({ uid, showKey: id, firebase })
      dispatch(setShowEpisodes({ id, episodes }))
    } catch (err) {
      dispatch(setError(err))
    }
  }

export const handleNewShow =
  (showData: UserShowsInterface, uid: string, firebase: FirebaseInterface): AppThunk =>
  async (dispatch) => {
    const isWatchingShow = showData.database === "watchingShows"
    try {
      let episodes: SeasonEpisodesFromDatabaseInterface[] = []
      const showInfoSnapshot = await firebase.showInfo(showData.id).once("value")
      if (showInfoSnapshot.val() === null) {
        throw new Error(
          "There's no data in database, by this path. And if this function is called the data should be here.\n" +
            "Find out the reason why the data is missing at the point of calling this function."
        )
      }

      if (isWatchingShow) {
        episodes = await fetchEpisodesFullData({ uid, showKey: showData.id, firebase })
      }
      const show = {
        ...showInfoSnapshot.val(),
        ...showData,
        episodes,
        episodesFetched: isWatchingShow
      }
      dispatch(addNewShow(show))
    } catch (err) {
      dispatch(setError(err))
    }
  }

export const handleChangeShow =
  (showData: UserShowsInterface, uid: string, firebase: FirebaseInterface): AppThunk =>
  async (dispatch, getState) => {
    const showFromStore = selectShow(getState(), showData.id)
    console.log({ showFromStore })
    if (!showFromStore) return

    const isWatchingShow = showData.database === "watchingShows"
    const isEpisodesFetched = showFromStore.episodesFetched

    if (!isWatchingShow || isEpisodesFetched) {
      console.log("allready fetched")
      dispatch(changeShow(showData))
      return
    }

    try {
      const episodes = await fetchEpisodesFullData({ uid, showKey: showData.id, firebase })
      console.log("handleChangeShow after AWAIT")

      const show = { ...showData, episodes, episodesFetched: true }
      dispatch(changeShow(show))
    } catch (err) {
      dispatch(setError(err))
    }
  }
