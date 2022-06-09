import { RootState } from 'app/store'
import merge from 'deepmerge'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { combineMergeObjects } from 'Utils'
import { EpisodesFromUserDatabase } from 'Components/Firebase/@TypesFirebase'
import { UserShowsStoreState, ShowInfoStoreState, EpisodesStoreState } from './@Types'

const userShowsInitialState: UserShowsStoreState = {
  data: {
    ids: [],
    info: {},
    episodes: {},
    timeStamps: {},
  },
  loading: true,
  error: null,
}

export const userShowsSliceRed = createSlice({
  name: 'userShows',
  initialState: userShowsInitialState,
  reducers: {
    setUserShows: {
      reducer(state, action: PayloadAction<UserShowsStoreState['data']>) {
        console.log({ initialPayload: action.payload })
        state.data = action.payload
        state.loading = false
      },
      prepare(data: ShowInfoStoreState[]) {
        const ids: UserShowsStoreState['data']['ids'] = []
        const info: UserShowsStoreState['data']['info'] = {}
        const episodes: UserShowsStoreState['data']['episodes'] = {}
        const timeStamps: UserShowsStoreState['data']['timeStamps'] = {}
        data.forEach((item) => {
          ids.push(item.id)
          episodes[item.key] = item.episodes
          timeStamps[item.key] = item.timeStamp
          info[item.key] = item
          info[item.key].episodes = []
        })
        return {
          payload: {
            ids,
            info,
            episodes,
            timeStamps,
          },
        }
      },
    },
    addNewShow: (state, action: PayloadAction<ShowInfoStoreState>) => {
      console.log(action.payload)
      if (state.data.ids.includes(action.payload.id)) return
      state.data.ids.push(action.payload.id)

      state.data.episodes[action.payload.id] = action.payload.episodes
      action.payload.episodes = []
      state.data.info[action.payload.id] = action.payload
      state.data.timeStamps[action.payload.id] = action.payload.timeStamp
    },
    changeShow: (state, action: PayloadAction<ShowInfoStoreState>) => {
      const show = state.data.info[action.payload.id]
      const episodes = state.data.episodes[action.payload.id]
      state.data.episodes[action.payload.id] = action.payload.episodes || episodes || []
      action.payload.episodes = []
      state.data.info[action.payload.id] = { ...show, ...action.payload }
    },
    setShowEpisodes: (state, action: PayloadAction<{ id: number; episodes: EpisodesStoreState[] }>) => {
      state.data.episodes[action.payload.id] = action.payload.episodes
      state.data.info[action.payload.id].episodesFetched = true
    },
    changeShowEpisodes: (
      state,
      action: PayloadAction<{ id: number; episodes: EpisodesFromUserDatabase['episodes'] }>,
    ) => {
      const stateEpisodes = state.data.episodes[action.payload.id]
      if (!stateEpisodes.length) return
      const mergeEpisodes: EpisodesStoreState[] = merge(stateEpisodes, action.payload.episodes, {
        arrayMerge: combineMergeObjects,
      })
      state.data.episodes[action.payload.id] = mergeEpisodes
    },
    updateLoadingShows: (state, action: PayloadAction<UserShowsStoreState['loading']>) => {
      console.log(action.payload)
      state.loading = action.payload
    },
    resetShows: () => {
      return { ...userShowsInitialState, loading: false }
    },
    setShowsError: (state, action: PayloadAction<UserShowsStoreState['error']>) => {
      console.log(action.payload)
      state.error = action.payload
      state.loading = false
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
  resetShows,
  setShowsError,
} = userShowsSliceRed.actions

export const selectShows = (state: RootState) => state.userShows.data.info
export const selectEpisodes = (state: RootState) => state.userShows.data.episodes
export const selectShowsIds = (state: RootState) => state.userShows.data.ids
export const selectShow = (state: RootState, id: number) => state.userShows.data.info[id]
export const selectShowEpisodes = (state: RootState, id: number) => state.userShows.data.episodes[id]
export const selectShowDatabase = (state: RootState, id: number) => state.userShows.data.info[id]?.database
export const selectShowsLoading = (state: RootState) => state.userShows.loading

export const selectShowsError = (state: RootState) => state.userShows.error

export default userShowsSliceRed.reducer
