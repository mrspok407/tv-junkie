import { useEffect, useCallback, useReducer } from 'react'
import axios from 'axios'
import useAxiosPromise from 'Utils/Hooks/UseAxiosPromise'
import { isArrayIncludes } from 'Utils'
import { SeasonTMDB } from 'Utils/@TypesTMDB'
import { ActionTypesEnum, FETCH_SEASONS_INITIAL_STATE } from './ReducerConfig/@Types'
import reducer from './ReducerConfig'

type Props = {
  disable: boolean
  showId: number
  preloadSeason: SeasonTMDB
}

function useFetchSeasons<DataType>({ showId, preloadSeason }: Props) {
  const [state, dispatch] = useReducer(reducer<DataType>(), FETCH_SEASONS_INITIAL_STATE)
  const { loadingData, errors, fetchedData } = state

  const getPromise = useAxiosPromise({ showId })

  const handleFetch = useCallback(
    async ({ seasonNum, seasonId }: { seasonNum: number; seasonId: number }) => {
      if (loadingData.includes(seasonId)) return
      dispatch({ type: ActionTypesEnum.HandleLoading, payload: { seasonId } })

      try {
        const { data } = await getPromise(seasonNum)
        // throw new Error('error test')
        console.log({ data })
        const episodes = [...data[`season/${seasonNum}`].episodes].reverse()

        dispatch({
          type: ActionTypesEnum.HandleSuccess,
          payload: { seasonId, data: { seasonId, episodes } },
        })
      } catch (error) {
        if (axios.isCancel(error)) return
        console.log({ error })
        dispatch({ type: ActionTypesEnum.HandleFailure, payload: { seasonId } })
      }
    },
    [getPromise, loadingData],
  )

  useEffect(() => {
    const { id } = preloadSeason
    if (isArrayIncludes(id, loadingData) || isArrayIncludes(id, fetchedData) || isArrayIncludes(id, errors)) return
    handleFetch({ seasonNum: preloadSeason.season_number, seasonId: preloadSeason.id })
  }, [handleFetch, preloadSeason, loadingData, fetchedData, errors])

  return { state, handleFetch }
}

export default useFetchSeasons
