import { createSlice, current, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from 'app/store'
import merge from 'deepmerge'
import { combineMergeObjects } from 'Utils'
import { AuthUserInterface } from './@Types'

export const authUserInitialState: AuthUserInterface = {
  authUser: {
    uid: '',
    email: '',
    emailVerified: null,
    username: '',
  },
}

export const authUserSlice = createSlice({
  name: 'authUser',
  initialState: authUserInitialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<AuthUserInterface['authUser']>) => {
      state.authUser = action.payload
    },
    resetAuthUser: (state) => {
      console.log(current(state))
      return authUserInitialState
    },
  },
})

export const { setAuthUser, resetAuthUser } = authUserSlice.actions

export const selectAuthUser = (state: RootState) => state.authUser

export default authUserSlice.reducer