import { useEffect, useCallback, useReducer } from 'react'
import axios from 'axios'
import useAxiosPromise from 'Utils/Hooks/UseAxiosPromise'
import { isArrayIncludes } from 'Utils'
import { SeasonTMDB } from 'Utils/@TypesTMDB'
import { ActionTypesEnum, FETCH_SEASONS_INITIAL_STATE } from './ReducerConfig/@Types'
import reducer from './ReducerConfig'

type Props = {
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
          payload: { seasonId, data: { showTitle: data.name, seasonId, episodes } },
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
    const { id: seasonId } = preloadSeason
    if (isArrayIncludes(seasonId, fetchedData) || isArrayIncludes(seasonId, errors)) return
    if (isArrayIncludes(seasonId, loadingData)) return

    handleFetch({ seasonNum: preloadSeason.season_number, seasonId })
  }, [handleFetch, preloadSeason, loadingData, fetchedData, errors])

  return { state, handleFetch, dispatch }
}

export default useFetchSeasons
