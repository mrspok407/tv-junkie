import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import userShowsReducer from '../Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import authUserReducer, { authUserInitialState } from '../Components/UserAuth/Session/Authentication/authUserSlice'

export const store = configureStore({
  reducer: {
    userShows: userShowsReducer,
    authUser: authUserReducer,
  },
  preloadedState: {
    authUser: {
      authUser: JSON.parse(localStorage.getItem('authUser')!) || authUserInitialState.authUser,
    },
  },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>
