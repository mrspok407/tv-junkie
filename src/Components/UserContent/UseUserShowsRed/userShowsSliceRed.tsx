import { RootState } from 'app/store'
import merge from 'deepmerge'
import { createSlice, current, PayloadAction } from '@reduxjs/toolkit'
import { combineMergeObjects } from 'Utils'
import { SeasonEpisodesFromDatabaseInterface, UserShowsState, UserShowsInterface } from './@Types'

const userShowsInitialState: UserShowsState = {
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
      reducer(state, action: PayloadAction<UserShowsState['data']>) {
        console.log({ initialPayload: action.payload })
        state.data = action.payload
        state.loading = false
      },
      prepare(data: UserShowsInterface[]) {
        const ids: UserShowsState['data']['ids'] = []
        const info: UserShowsState['data']['info'] = {}
        const episodes: UserShowsState['data']['episodes'] = {}
        const timeStamps: UserShowsState['data']['timeStamps'] = {}
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
    addNewShow: (state, action: PayloadAction<UserShowsInterface>) => {
      console.log(action.payload)
      if (state.data.ids.includes(action.payload.id)) return
      state.data.ids.push(action.payload.id)

      state.data.episodes[action.payload.id] = action.payload.episodes
      action.payload.episodes = []
      state.data.info[action.payload.id] = action.payload
      state.data.timeStamps[action.payload.id] = action.payload.timeStamp
    },
    changeShow: (state, action: PayloadAction<UserShowsInterface>) => {
      const show = state.data.info[action.payload.id]
      const episodes = state.data.episodes[action.payload.id]
      state.data.episodes[action.payload.id] = action.payload.episodes || episodes || []
      action.payload.episodes = []
      state.data.info[action.payload.id] = { ...show, ...action.payload }
    },
    setShowEpisodes: (
      state,
      action: PayloadAction<{ id: number; episodes: SeasonEpisodesFromDatabaseInterface[] }>,
    ) => {
      state.data.episodes[action.payload.id] = action.payload.episodes
      state.data.info[action.payload.id].episodesFetched = true
    },
    changeShowEpisodes: (
      state,
      action: PayloadAction<{ id: number; episodes: SeasonEpisodesFromDatabaseInterface[] }>,
    ) => {
      console.time('test')
      const stateEpisodes = state.data.episodes[action.payload.id]
      if (!stateEpisodes.length) return
      const mergeEpisodes: SeasonEpisodesFromDatabaseInterface[] = merge(stateEpisodes, action.payload.episodes, {
        arrayMerge: combineMergeObjects,
      })
      console.timeEnd('test')
      console.log({ mergeEpisodes })
      state.data.episodes[action.payload.id] = mergeEpisodes
    },
    updateLoadingShows: (state, action: PayloadAction<UserShowsState['loading']>) => {
      console.log(action.payload)
      state.loading = action.payload
    },
    resetShows: () => {
      return { ...userShowsInitialState, loading: false }
    },
    setError: (state, action: PayloadAction<any>) => {
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
  setError,
} = userShowsSliceRed.actions

export const selectShows = (state: RootState) => state.userShows.data.info
export const selectEpisodes = (state: RootState) => state.userShows.data.episodes
export const selectShowsIds = (state: RootState) => state.userShows.data.ids
export const selectShow = (state: RootState, id: number) => state.userShows.data.info[id]
export const selectShowDatabase = (state: RootState, id: number) => state.userShows.data.info[id]?.database
export const selectShowsLoading = (state: RootState) => state.userShows.loading

export const selectShowEpisodes = (state: RootState, id: number) => state.userShows.data.episodes[id]

export default userShowsSliceRed.reducer