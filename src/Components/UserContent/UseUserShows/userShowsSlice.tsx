import { createSlice, createAction, PayloadAction, current, createSelector, createAsyncThunk } from "@reduxjs/toolkit"
import { AnyAction } from "redux"
import { ThunkAction } from "redux-thunk"
import { AppThunk, RootState } from "app/store"
import { SnapshotVal } from "Components/AppContext/@Types"
import sortDataSnapshot from "../FirebaseHelpers/sortDataSnapshot"
import { SeasonEpisodesFromDatabaseInterface, UserShowsInterface } from "./UseUserShows"
import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import fetchShowsFullData from "./FirebaseHelpers/fetchShowsFullData"
import { merge } from "lodash"
import { combineMergeObjects } from "Utils"
import { userShowsListeners } from "./FirebaseHelpers/Listeners"

interface UserShowsState {
  data: {
    ids: number[]
    content: {
      [key: string]: UserShowsInterface
    }
    timeStamps: {
      [key: string]: number
    }
  }
  initialLoading: boolean
  error: any
}

const initialState: UserShowsState = {
  data: {
    ids: [],
    content: {},
    timeStamps: {}
  },
  initialLoading: true,
  error: null
}

export const userShowsSlice = createSlice({
  name: "userShows",
  initialState,
  reducers: {
    setUserShows: {
      reducer(state, action: PayloadAction<UserShowsState["data"]>) {
        console.log(action.payload)
        state.data.ids = action.payload.ids
        state.data.content = action.payload.content
        state.data.timeStamps = action.payload.timeStamps
        state.initialLoading = false
      },
      prepare(data: UserShowsInterface[]) {
        const content: UserShowsState["data"]["content"] = {}
        const timeStamps: UserShowsState["data"]["timeStamps"] = {}
        data.forEach((item) => {
          content[item.key] = item
          timeStamps[item.key] = item.timeStamp
        })
        const ids = data.map((item) => item.id)
        return {
          payload: { ids, content, timeStamps }
        }
      }
    },
    addNewShow: (state, action: PayloadAction<UserShowsInterface>) => {
      console.log(action.payload)
      if (state.data.ids.includes(action.payload.id)) return
      state.data.ids.push(action.payload.id)
      state.data.content[action.payload.id] = action.payload
      state.data.timeStamps[action.payload.id] = action.payload.timeStamp
    },
    changeShow: (state, action: PayloadAction<UserShowsInterface>) => {
      const show = state.data.content[action.payload.id]
      const timeStamp = state.data.timeStamps[action.payload.id]
      if (timeStamp !== action.payload.timeStamp) {
        console.log("change show ts not equal")
        state.data.timeStamps[action.payload.id] = action.payload.timeStamp
        return
      }
      console.log(action.payload)
      state.data.content[action.payload.id] = { ...show, ...action.payload }
    },
    updateInitialLoading: (state, action: PayloadAction<UserShowsState["initialLoading"]>) => {
      state.initialLoading = action.payload
    },
    setError: (state, action: PayloadAction<any>) => {
      state.error = action.payload.error
      state.initialLoading = false
    }
  }
})

export const { setUserShows, addNewShow, changeShow, setError } = userShowsSlice.actions

export const fetchUserShows =
  (uid: string, firebase: FirebaseInterface): AppThunk =>
  async (dispatch) => {
    try {
      const userShowsSnapshot = await firebase.userAllShows(uid).orderByChild("timeStamp").once("value")
      const userShows = sortDataSnapshot<UserShowsInterface>(userShowsSnapshot)
      const showsFullData = await fetchShowsFullData({ userShows, firebase })
      const mergedShows: UserShowsInterface[] = merge(showsFullData, userShows, {
        arrayMerge: combineMergeObjects
      })

      dispatch(setUserShows(mergedShows))
      dispatch(userShowsListeners({ uid, firebase }))
    } catch (err) {
      dispatch(setError(err))
    }
  }

export const handleNewShow =
  (showData: UserShowsInterface, firebase: FirebaseInterface): AppThunk =>
  async (dispatch) => {
    const isWatchingShow = showData.database === "watchingShows"
    const firebaseRef = isWatchingShow ? firebase.showFullData(showData.id) : firebase.showInfo(showData.id)
    try {
      const showFullDataSnapshot: SnapshotVal<{ info: {}; episodes: SeasonEpisodesFromDatabaseInterface[] }> =
        await firebaseRef.once("value")

      console.log("handleNewShow after AWAIT")

      if (showFullDataSnapshot.val() === null) {
        throw new Error(
          "There's no data in database, by this path. And if this function is called the data should be here.\n" +
            "Find out the reason why the data is missing at the point of calling this function."
        )
      }
      const info = isWatchingShow ? showFullDataSnapshot.val().info : showFullDataSnapshot.val()
      const show = {
        ...info,
        ...showData,
        episodes: showFullDataSnapshot.val().episodes || [],
        episodesFetched: isWatchingShow
      }
      dispatch(addNewShow(show))
    } catch (err) {
      dispatch(setError(err))
    }
  }

export const handleChangeShow =
  (showData: UserShowsInterface, firebase: FirebaseInterface): AppThunk =>
  async (dispatch, getState) => {
    const showFromState = selectUserShow(getState(), showData.id)
    if (!showFromState) return

    const isWatchingShow = showData.database === "watchingShows"
    const isEpisodesFetched = showFromState.episodesFetched

    if (!isWatchingShow || isEpisodesFetched) {
      console.log("allready fetched")
      dispatch(changeShow(showData))
      return
    }

    const firebaseRef = firebase.showEpisodes(showData.id)
    try {
      const showEpisodesSnapshot: SnapshotVal<SeasonEpisodesFromDatabaseInterface[]> = await firebaseRef.once("value")
      console.log("handleChangeShow after AWAIT")

      if (showEpisodesSnapshot.val() === null) {
        dispatch(changeShow(showData))
        return
      }
      console.log("fetch")
      const show = { ...showData, episodes: showEpisodesSnapshot.val(), episodesFetched: true }
      dispatch(changeShow(show))
    } catch (err) {
      dispatch(setError(err))
    }
  }

export const selectUserShows = (state: RootState) => state.userShows.data.info
export const selectUserShowsIds = (state: RootState) => state.userShows.data.ids
export const selectUserShow = (state: RootState, id: number) => state.userShows.data.info[id]
export const selectUserShowsLoading = (state: RootState) => state.userShows.initialLoading

export default userShowsSlice.reducer
