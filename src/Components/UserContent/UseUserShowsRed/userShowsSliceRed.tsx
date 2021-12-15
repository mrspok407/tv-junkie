import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "app/store"
import { UserShowsState } from "./@Types"
import { UserShowsInterface } from "./@Types"

const initialState: UserShowsState = {
  data: {
    ids: [],
    info: {},
    episodes: {},
    timeStamps: {}
  },
  initialLoading: true,
  error: null
}

export const userShowsSliceRed = createSlice({
  name: "userShows",
  initialState,
  reducers: {
    setUserShows: {
      reducer(state, action: PayloadAction<UserShowsState["data"]>) {
        console.log(action.payload)
        state.data = action.payload
        state.initialLoading = false
      },
      prepare(data: UserShowsInterface[]) {
        const info: UserShowsState["data"]["info"] = {}
        const episodes: UserShowsState["data"]["episodes"] = {}
        const timeStamps: UserShowsState["data"]["timeStamps"] = {}
        const ids: UserShowsState["data"]["ids"] = []
        data.forEach((item) => {
          ids.push(item.id)
          episodes[item.key] = item.episodes
          timeStamps[item.key] = item.timeStamp
          info[item.key] = item
          info[item.key].episodes = []
        })
        return {
          payload: { ids, info, episodes, timeStamps }
        }
      }
    },
    addNewShow: (state, action: PayloadAction<UserShowsInterface>) => {
      console.log(action.payload)
      if (state.data.ids.includes(action.payload.id)) return
      state.data.ids.push(action.payload.id)

      state.data.episodes[action.payload.id] = action.payload.episodes
      action.payload.episodes = []
      state.data.info[action.payload.id] = action.payload
      state.data.timeStamps[action.payload.id] = action.payload.timeStamp
    },
    changeShow: (state, action: PayloadAction<UserShowsInterface>) => {
      const show = state.data.info[action.payload.id]
      const timeStamp = state.data.timeStamps[action.payload.id]
      if (timeStamp !== action.payload.timeStamp) {
        console.log("change show ts not equal")
        state.data.timeStamps[action.payload.id] = action.payload.timeStamp
        return
      }
      console.log(action.payload)
      state.data.episodes[action.payload.id] = action.payload.episodes || []
      action.payload.episodes = []
      state.data.info[action.payload.id] = { ...show, ...action.payload }
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

export const { setUserShows, addNewShow, changeShow, setError } = userShowsSliceRed.actions

export const selectUserShows = (state: RootState) => state.userShows.data.info
export const selectUserShowsIds = (state: RootState) => state.userShows.data.ids
export const selectUserShow = (state: RootState, id: number) => state.userShows.data.info[id]
export const selectUserShowsLoading = (state: RootState) => state.userShows.initialLoading

export default userShowsSliceRed.reducer
