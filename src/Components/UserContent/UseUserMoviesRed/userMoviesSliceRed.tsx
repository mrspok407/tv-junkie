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
    addMovie: (state, action: PayloadAction<MovieInfoFromUserDatabase>) => {
      console.log(action.payload)

      if (state.data.ids.includes(action.payload.id)) return
      state.data.ids.push(action.payload.id)
      state.data.info[action.payload.id] = action.payload
      state.data.timeStamps[action.payload.id] = action.payload.timeStamp
    },
    removeMovie: (state, action: PayloadAction<number>) => {
      const { ids } = state.data

      state.data.ids = ids.filter((id) => id !== action.payload)
      delete state.data.info[action.payload]
      delete state.data.timeStamps[action.payload]
    },
    changeMovie: (state, action: PayloadAction<MovieInfoFromUserDatabase>) => {
      state.data.info[action.payload.id] = action.payload
    },
    updateLoadingMovie: (state, action: PayloadAction<UserMoviesStoreState['loadingMovie']>) => {
      state.loadingMovie = action.payload
    },
    resetMovies: () => {
      return USER_MOVIES_RESET_STATE
    },
    setMoviesError: (state, action: PayloadAction<UserMoviesStoreState['error']>) => {
      console.log(action.payload)
      state.error = action.payload
      state.initialLoading = false
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

export const { setUserMovies, addMovie, removeMovie, changeMovie, updateLoadingMovie, resetMovies, setMoviesError } =
  userMoviesSliceRed.actions

export const selectMovies = (state: RootState) => state.userMovies.data.info
export const selectMoviesIds = (state: RootState) => state.userMovies.data.ids
export const selectMovie = (state: RootState, id: number) => state.userMovies.data.info[id]
export const selectMovieRating = (state: RootState, id: number) => selectMovie(state, id)?.userRating

export const selectMoviesLoading = (state: RootState) => state.userMovies.initialLoading
export const selectLoadingMovie = (state: RootState) => state.userMovies.loadingMovie

export const selectMoviesError = (state: RootState) => state.userMovies.error

export default userMoviesSliceRed.reducer
