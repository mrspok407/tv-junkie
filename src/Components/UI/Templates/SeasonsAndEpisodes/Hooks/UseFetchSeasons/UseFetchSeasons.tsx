import { useEffect, useCallback, useReducer } from 'react'
import axios from 'axios'
import reducer, { ActionTypesEnum, INITIAL_STATE } from './_reducerConfig'

type Props = {
  disable: boolean
  promiseData:
    | {
        promise: Promise<any>
        id: number | string
        seasonNum: number
      }
    | undefined
}

function useFetchSeasons<DataType>({ promiseData, disable = false }: Props) {
  const [state, dispatch] = useReducer(reducer<DataType>(), INITIAL_STATE)

  const handleFetch = useCallback(async () => {
    if (!promiseData || disable) return
    const id = promiseData.id.toString()

    dispatch({ type: ActionTypesEnum.HandleLoading, payload: { id, loading: true } })
    try {
      const { data } = await promiseData.promise
      const episodesReverse = data[`season/${promiseData.seasonNum}`].episodes.reverse()

      dispatch({
        type: ActionTypesEnum.HandleSuccess,
        payload: { id, data: { seasonId: Number(id), episodes: episodesReverse } },
      })
    } catch (error) {
      if (axios.isCancel(error)) return
      dispatch({ type: ActionTypesEnum.HandleFailure, payload: { id } })
    }
  }, [promiseData, disable])

  useEffect(() => {
    handleFetch()
  }, [handleFetch])

  return { state, dispatch }
}

export default useFetchSeasons
