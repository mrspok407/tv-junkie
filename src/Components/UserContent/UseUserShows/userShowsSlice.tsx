import { createSlice, PayloadAction, current } from "@reduxjs/toolkit"
import { RootState } from "app/store"
import { UserShowsInterface } from "./UseUserShows"

interface UserShowsState {
  data: {
    [key: string]: UserShowsInterface
  }
  initialLoading: boolean
}

const initialState: UserShowsState = {
  data: {},
  initialLoading: true
}

export const counterSlice = createSlice({
  name: "userShows",
  initialState,
  reducers: {
    updateUserShows: (state, action: PayloadAction<UserShowsState["data"]>) => {
      state.data = action.payload
      state.initialLoading = false
    },
    addNewShow: (state, action: PayloadAction<UserShowsInterface>) => {
      state.data[action.payload.id] = action.payload
    },
    updateInitialLoading: (state, action: PayloadAction<UserShowsState["initialLoading"]>) => {
      state.initialLoading = action.payload
    }
  }
})

export const { updateUserShows, addNewShow, updateInitialLoading } = counterSlice.actions

export const selectUserShows = (state: RootState) => state.userShows

export default counterSlice.reducer
