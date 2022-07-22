import { RootState } from 'app/store'
import merge from 'deepmerge'
import { createSlice, current, PayloadAction } from '@reduxjs/toolkit'
import { combineMergeObjects } from 'Utils'
import { EpisodesFromUserDatabase } from 'Components/Firebase/@TypesFirebase'
import {
  UserMoviesStoreState,
  MovieFullDataStoreState,
  UserMovieStatuses,
  USER_MOVIES_INITIAL_STATE,
  USER_MOVIES_RESET_STATE,
} from './@Types'

export const userMoviesSliceRed = createSlice({
  name: 'userMovies',
  initialState: USER_MOVIES_INITIAL_STATE,
  reducers: {
    setUserMovies: {
      reducer(state, action: PayloadAction<UserMoviesStoreState['data']>) {},
      prepare(data: MovieFullDataStoreState[]) {},
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
export const selectMovieDatabase = (state: RootState, id: number) => state.userMovies.data.info[id]?.database
export const selectMoviesLoading = (state: RootState) => state.userMovies.initialLoading
export const selectLoadingNewMovie = (state: RootState) => state.userMovies.loadingNewMovie

export const selectMoviesError = (state: RootState) => state.userMovies.error

export default userMoviesSliceRed.reducer
