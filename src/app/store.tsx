import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit"
import userShowsReducer from "../Components/UserContent/UseUserShows/userShowsSlice"
import { testSlice } from "../Components/UserContent/UseUserShows/userShowsSlice"

export const store = configureStore({
  reducer: {
    userShows: userShowsReducer,
    test: testSlice.reducer
  }
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>
