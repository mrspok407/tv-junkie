import produce from 'immer'
import * as React from 'react'
import { isArrayIncludes } from 'Utils'
import { FetchSeasonsInt, ACTIONTYPES, ActionTypesEnum } from './@Types'

const reducer = <T,>(): React.Reducer<FetchSeasonsInt<T>, ACTIONTYPES> =>
  produce((draft, action) => {
    const { openData, loadingData, fetchedData, errors } = draft
    const isSeasonLoading = (id: number) => loadingData.includes(id)

    switch (action.type) {
      case ActionTypesEnum.HandleLoading: {
        const { seasonId } = action.payload
        if (fetchedData.includes(seasonId) || isSeasonLoading(seasonId)) break
        draft.loadingData = [...loadingData, action.payload.seasonId]
        break
      }

      case ActionTypesEnum.HandleSuccess: {
        const { data, seasonId, isSideEffect } = action.payload

        if (fetchedData.includes(seasonId)) {
          if (isSideEffect) return
          draft.openData = openData.includes(seasonId)
            ? openData.filter((item) => item !== seasonId)
            : [...openData, seasonId]
          break
        }

        draft.loadingData = loadingData.filter((item) => item !== seasonId)
        draft.data.push(data)
        draft.fetchedData.push(seasonId)
        draft.openData.push(seasonId)
        draft.errors = errors.filter((item) => item !== seasonId)
        break
      }

      case ActionTypesEnum.HandleOpenData: {
        const { seasonId } = action.payload
        draft.openData = openData.includes(seasonId)
          ? openData.filter((item) => item !== seasonId)
          : [...openData, seasonId]
        break
      }

      case ActionTypesEnum.HandleCloseAll: {
        draft.openData = []
        break
      }

      case ActionTypesEnum.HandleFailure: {
        const { seasonId } = action.payload
        draft.loadingData = loadingData.filter((item) => item !== seasonId)
        if (!isArrayIncludes(seasonId, errors)) {
          draft.errors = [...errors, seasonId]
        }
        break
      }

      default:
        break
    }
  })

export default reducer
