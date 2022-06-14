import { RootState } from 'app/store'
import merge from 'deepmerge'
import { createSlice, current, PayloadAction } from '@reduxjs/toolkit'
import { combineMergeObjects } from 'Utils'
import { EpisodesFromUserDatabase, ShowInfoFromUserDatabase } from 'Components/Firebase/@TypesFirebase'
import { UserShowsStoreState, ShowFullDataStoreState, EpisodesStoreState } from './@Types'

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
      prepare(data: ShowFullDataStoreState[]) {
        const preparedData = data.reduce(
          (acc: UserShowsStoreState['data'], item) => {
            acc.ids = [...acc.ids, item.id]
            acc.episodes[item.key] = item.episodes
            acc.timeStamps[item.key] = item.timeStamp
            acc.info[item.key] = item
            acc.info[item.key].episodes = []
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
      if (state.data.ids.includes(action.payload.id)) return
      state.data.ids.push(action.payload.id)

      state.data.episodes[action.payload.id] = action.payload.episodes
      action.payload.episodes = []
      state.data.info[action.payload.id] = action.payload
      state.data.timeStamps[action.payload.id] = action.payload.timeStamp
    },
    changeShow: (state, action: PayloadAction<ShowFullDataStoreState>) => {
      const show = state.data.info[action.payload.id]
      state.data.info[action.payload.id] = { ...show, ...action.payload }

      console.log({ changeShowsPay: action.payload })

      if (!show.episodesFetched) {
        state.data.episodes[action.payload.id] = action.payload.episodes
      }
    },
    setShowEpisodes: (state, action: PayloadAction<{ id: number; episodes: EpisodesStoreState[] }>) => {
      console.log(action.payload.episodes)
      state.data.episodes[action.payload.id] = action.payload.episodes
      state.data.info[action.payload.id].episodesFetched = true
    },
    changeShowEpisodes: (state, action: PayloadAction<{ id: number; data: EpisodesFromUserDatabase }>) => {
      const stateInfo = state.data.info[action.payload.id]
      const stateEpisodes = state.data.episodes[action.payload.id]
      const { episodes, info } = action.payload.data

      if (stateInfo.database !== info.database) return
      if (!stateEpisodes.length) return

      console.log('changeShowEpisodes')

      const mergeEpisodes: EpisodesStoreState[] = merge(stateEpisodes, episodes, {
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
