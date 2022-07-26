import { RootState } from 'app/store'
import merge from 'deepmerge'
import { createAction, createSlice, current, PayloadAction } from '@reduxjs/toolkit'
import { combineMergeObjects } from 'Utils'
import { EpisodesFromUserDatabase, MovieInfoFromUserDatabase } from 'Components/Firebase/@TypesFirebase'
import { UserMoviesStoreState, UserMovieStatuses, USER_MOVIES_INITIAL_STATE, USER_MOVIES_RESET_STATE } from './@Types'
import { resetErrors, resetSlicesState, setInitialContentLoading } from '../SharedActions'

export const userMoviesSliceRed = createSlice({
  name: 'userMovies',
  initialState: USER_MOVIES_INITIAL_STATE,
  reducers: {
    setUserMovies: {
      reducer(state, action: PayloadAction<UserMoviesStoreState['data']>) {
        console.log({ initialPayloadMovies: action.payload })
        state.data = action.payload
        state.initialLoading = false
      },
      prepare(data: MovieInfoFromUserDatabase[]) {
        const preparedData = data.reduce(
          (acc: UserMoviesStoreState['data'], item) => {
            acc.ids = [...acc.ids, item.id]
            acc.timeStamps[item.key] = item.timeStamp
            acc.info[item.key] = item
            return acc
          },
          { ids: [], info: {}, timeStamps: {} },
        )

        return {
          payload: preparedData,
        }
      },
    },
    addNewMovie: (state, action: PayloadAction<MovieFullDataStoreState>) => {},
    changeUserMovieStatus: (state, action: PayloadAction<{ id: number; userMovieStatus: UserMovieStatuses }>) => {},
    updateLoadingMovies: (state, action: PayloadAction<UserMoviesStoreState['initialLoading']>) => {},
    updateLoadingNewMovie: (state, action: PayloadAction<UserMoviesStoreState['loadingNewMovie']>) => {},
    resetMovies: () => {
      return USER_MOVIES_RESET_STATE
    },
    setMoviesError: (state, action: PayloadAction<UserMoviesStoreState['error']>) => {
      console.log(action.payload)
      state.error = action.payload
      state.initialLoading = false
      state.loadingNewMovie = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setInitialContentLoading, (state, action) => {
        state.initialLoading = action.payload
      })
      .addCase(resetErrors, (state, action) => {
        state.error = action.payload
      })
      .addCase(resetSlicesState, () => {
        return USER_MOVIES_RESET_STATE
      })
  },
})

export const {
  setUserMovies,
  addNewMovie,
  updateLoadingMovies,
  updateLoadingNewMovie,
  resetMovies,
  setMoviesError,
  changeUserMovieStatus,
} = userMoviesSliceRed.actions

export const selectMovies = (state: RootState) => state.userMovies.data.info
export const selectMoviesIds = (state: RootState) => state.userMovies.data.ids
export const selectMovie = (state: RootState, id: number) => state.userMovies.data.info[id]
export const selectMoviesLoading = (state: RootState) => state.userMovies.initialLoading
export const selectLoadingNewMovie = (state: RootState) => state.userMovies.loadingNewMovie

export const selectMoviesError = (state: RootState) => state.userMovies.error

export default userMoviesSliceRed.reducer
