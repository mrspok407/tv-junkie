import { RootState } from 'app/store'
import merge from 'deepmerge'
import { createSlice, current, PayloadAction } from '@reduxjs/toolkit'
import { combineMergeObjects } from 'Utils'
import { EpisodesFromUserDatabase } from 'Components/Firebase/@TypesFirebase'
import {
  UserShowsStoreState,
  ShowFullDataStoreState,
  EpisodesStoreState,
  UserShowStatuses,
  USER_SHOWS_INITIAL_STATE,
  USER_SHOWS_RESET_STATE,
} from './@Types'

export const userShowsSliceRed = createSlice({
  name: 'userShows',
  initialState: USER_SHOWS_INITIAL_STATE,
  reducers: {
    setUserShows: {
      reducer(state, action: PayloadAction<UserShowsStoreState['data']>) {
        console.log({ initialPayload: action.payload })
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
      action: PayloadAction<{ id: number; episodes: EpisodesFromUserDatabase['episodes'] }>,
    ) => {
      // const stateInfo = state.data.info[action.payload.id]
      const stateEpisodes = state.data.episodes[action.payload.id]
      const { episodes } = action.payload

      // console.log({ stateInfoDat: stateInfo?.database, payloadDatabase: info.database })

      // if (stateInfo?.database !== info.database) return
      if (!stateEpisodes?.length) return

      console.log('changeShowEpisodes')

      const mergeEpisodes: EpisodesStoreState[] = merge(stateEpisodes, episodes, {
        arrayMerge: combineMergeObjects,
      })
      state.data.episodes[action.payload.id] = mergeEpisodes
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
export const selectShow = (state: RootState, id: number) => state.userShows.data.info[id]
export const selectShowEpisodes = (state: RootState, id: number) => state.userShows.data.episodes[id]
export const selectShowDatabase = (state: RootState, id: number) => state.userShows.data.info[id]?.database
export const selectShowsLoading = (state: RootState) => state.userShows.initialLoading
export const selectLoadingNewShow = (state: RootState) => state.userShows.loadingNewShow

export const selectShowsError = (state: RootState) => state.userShows.error

export default userShowsSliceRed.reducer
