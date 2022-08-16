import { RootState } from 'app/store'
import { createSelector, createSlice, current, PayloadAction } from '@reduxjs/toolkit'
import { EpisodesFromUserDatabase } from 'Components/Firebase/@TypesFirebase'
import {
  UserShowsStoreState,
  ShowFullDataStoreState,
  EpisodesStoreState,
  UserShowStatuses,
  USER_SHOWS_INITIAL_STATE,
  USER_SHOWS_RESET_STATE,
} from './@Types'
import { resetErrors, resetSlicesState, setInitialContentLoading } from '../SharedActions'
import { compareEpisodesAndWriteDraft } from './Utils'

export const userShowsSliceRed = createSlice({
  name: 'userShows',
  initialState: USER_SHOWS_INITIAL_STATE,
  reducers: {
    setUserShows: {
      reducer(state, action: PayloadAction<UserShowsStoreState['data']>) {
        console.log({ initialPayloadShows: action.payload })
        state.data = action.payload
        state.initialLoading = false
      },
      prepare(data: ShowFullDataStoreState[]) {
        const preparedData = data.reduce(
          (acc: UserShowsStoreState['data'], item) => {
            acc.ids = [...acc.ids, item.id]
            acc.episodes[item.key] = item.episodes
            acc.timeStamps[item.key] = item.timeStamp
            acc.info[item.key] = item
            acc.info[item.key]!.episodes = []
            return acc
          },
          { ids: [], info: {}, episodes: {}, timeStamps: {} },
        )

        return {
          payload: preparedData,
        }
      },
    },
    addNewShow: (state, action: PayloadAction<ShowFullDataStoreState>) => {
      console.log(action.payload)
      state.loadingNewShow = false

      if (state.data.ids.includes(action.payload.id)) return
      state.data.ids.push(action.payload.id)

      state.data.episodes[action.payload.id] = action.payload.episodes
      action.payload.episodes = []
      state.data.info[action.payload.id] = action.payload
      state.data.timeStamps[action.payload.id] = action.payload.timeStamp
    },
    changeShow: (
      state,
      action: PayloadAction<{
        info: ShowFullDataStoreState
        episodes?: EpisodesStoreState[]
      }>,
    ) => {
      const showFromStore = state.data.info[action.payload.info.id]
      state.data.info[action.payload.info.id] = action.payload.info
      state.data.timeStamps[action.payload.info.id] = action.payload.info.timeStamp

      console.log({ changeShowsPay: action.payload, showFromStore: current(showFromStore) })

      if (!showFromStore?.episodesFetched) {
        state.data.episodes[action.payload.info.id] = action.payload.episodes || []
      }
    },
    changeUserShowStatus: (state, action: PayloadAction<{ id: number; userShowStatus: UserShowStatuses }>) => {
      state.data.info[action.payload.id]!.database = action.payload.userShowStatus
    },
    setShowEpisodes: (state, action: PayloadAction<{ id: number; episodes: EpisodesStoreState[] }>) => {
      console.log(action.payload.episodes)
      state.data.episodes[action.payload.id] = action.payload.episodes
      state.data.info[action.payload.id]!.episodesFetched = true
    },
    changeShowEpisodes: (
      state,
      action: PayloadAction<{
        showId: number
        episodes: EpisodesFromUserDatabase['episodes']
        allReleasedEpisodesWatched: boolean | null
      }>,
    ) => {
      const episodesStore = state.data.episodes[action.payload.showId]
      const { episodes: episodesPayload } = action.payload

      compareEpisodesAndWriteDraft(episodesStore, episodesPayload)
      state.data.info[action.payload.showId].allReleasedEpisodesWatched = action.payload.allReleasedEpisodesWatched
    },
    updateLoadingShows: (state, action: PayloadAction<UserShowsStoreState['initialLoading']>) => {
      console.log(action.payload)
      state.initialLoading = action.payload
    },
    updateLoadingNewShow: (state, action: PayloadAction<UserShowsStoreState['loadingNewShow']>) => {
      console.log(action.payload)
      state.loadingNewShow = action.payload
    },
    resetShows: () => {
      return USER_SHOWS_RESET_STATE
    },
    setShowsError: (state, action: PayloadAction<UserShowsStoreState['error']>) => {
      console.log(action.payload)
      state.error = action.payload
      state.initialLoading = false
      state.loadingNewShow = false
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
        return USER_SHOWS_RESET_STATE
      })
  },
})

export const {
  setUserShows,
  addNewShow,
  changeShow,
  setShowEpisodes,
  changeShowEpisodes,
  updateLoadingShows,
  updateLoadingNewShow,
  resetShows,
  setShowsError,
  changeUserShowStatus,
} = userShowsSliceRed.actions

export const selectShows = (state: RootState) => state.userShows.data.info
export const selectEpisodes = (state: RootState) => state.userShows.data.episodes

export const selectShowsIds = (state: RootState) => state.userShows.data.ids
export const selectShowsIdsReverse = () => {
  const selector = createSelector(selectShowsIds, (ids) => {
    return [...ids].reverse()
  })
  return selector
}

export const selectShow = (state: RootState, showId: number): ShowFullDataStoreState | undefined =>
  state.userShows.data.info[showId]
export const selectShowEpisodes = (state: RootState, showId: number): EpisodesStoreState[] | undefined =>
  state.userShows.data.episodes[showId]
export const selectShowStatus = (state: RootState, showId: number) => selectShow(state, showId)?.database
export const selectShowRating = (state: RootState, showId: number) => selectShow(state, showId)?.userRating

export const selectSingleSeason = (state: RootState, showId: number, seasonNum: number) => {
  const episodes = selectShowEpisodes(state, showId)
  if (episodes === undefined) return undefined
  const singleSeason = episodes[seasonNum - 1]
  return singleSeason
}

export const selectSingleEpisode = (state: RootState, showId: number, seasonNum: number, episodeNumber: number) => {
  const episodes = selectShowEpisodes(state, showId)
  if (episodes === undefined) return undefined
  const singleEpisode = episodes[seasonNum - 1]?.episodes[episodeNumber - 1]
  return singleEpisode
}

export const selectShowDatabase = (state: RootState, showId: number) => state.userShows.data.info[showId]?.database
export const selectShowsLoading = (state: RootState) => state.userShows.initialLoading
export const selectLoadingNewShow = (state: RootState) => state.userShows.loadingNewShow

export const selectShowsError = (state: RootState) => state.userShows.error

export default userShowsSliceRed.reducer
