import { createSlice, current, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "app/store"
import { AuthUserInterface } from "./@Types"
import merge from "deepmerge"
import { combineMergeObjects } from "Utils"

export const authUserInitialState: AuthUserInterface = {
  authUser: {
    uid: "",
    email: "",
    emailVerified: null,
    username: ""
  }
}

export const authUserSlice = createSlice({
  name: "authUser",
  initialState: authUserInitialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<AuthUserInterface["authUser"]>) => {
      state.authUser = action.payload
    }
  }
})

export const { setAuthUser } = authUserSlice.actions

export const selectAuthUser = (state: RootState) => state.authUser

export default authUserSlice.reducer
