import produce from 'immer'
import * as React from 'react'
import { FetchSeasonsInt, ACTIONTYPES, ActionTypesEnum } from './@Types'

const reducer = <T,>(): React.Reducer<FetchSeasonsInt<T>, ACTIONTYPES> =>
  produce((draft, action) => {
    const { openData, loading, fetchedData, errors } = draft

    switch (action.type) {
      case ActionTypesEnum.HandleLoading: {
        const { seasonId } = action.payload
        if (fetchedData.includes(seasonId) || loading.includes(seasonId)) break
        draft.loading = [...loading, action.payload.seasonId]
        break
      }

      case ActionTypesEnum.HandleSuccess: {
        console.log('HandleSuccess')
        const { data, seasonId } = action.payload
        console.log(action.payload)
        if (fetchedData.includes(seasonId)) {
          draft.openData = openData.includes(seasonId)
            ? openData.filter((item) => item !== seasonId)
            : [...openData, seasonId]
          console.log('test')
          break
        }

        draft.loading = loading.filter((item) => item !== seasonId)
        draft.data.push(data)
        draft.fetchedData.push(seasonId)
        draft.openData.push(seasonId)
        break
      }

      case ActionTypesEnum.HandleOpenData: {
        const { seasonId } = action.payload
        draft.openData = openData.includes(seasonId)
          ? openData.filter((item) => item !== seasonId)
          : [...openData, seasonId]
        break
      }

      case ActionTypesEnum.HandleFailure: {
        const { seasonId } = action.payload
        draft.loading = loading.filter((item) => item !== seasonId)
        draft.errors = [...errors, seasonId]
        break
      }

      default:
        break
    }
  })

export default reducer
