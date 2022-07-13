import { useEffect, useCallback, useReducer } from 'react'
import axios from 'axios'
import { ActionTypesEnum, FETCH_SEASONS_INITIAL_STATE } from './ReducerConfig/@Types'
import reducer from './ReducerConfig'
import useAxiosPromise from 'Utils/Hooks/UseAxiosPromise'

type Props = {
  disable: boolean
  showId: number
  // promiseData:
  //   | {
  //       promise: Promise<any>
  //       id: number | string
  //       seasonNum: number
  //     }
  //   | undefined
}

function useFetchSeasons<DataType>({ showId, disable = false }: Props) {
  const [state, dispatch] = useReducer(reducer<DataType>(), FETCH_SEASONS_INITIAL_STATE)

  const getPromise = useAxiosPromise({
    fullRerenderDeps: showId,
    showId,
  })

  const handleFetch = useCallback(
    async ({ seasonNum, seasonId }: { seasonNum: number; seasonId: number }) => {
      // if (!promiseData || disable) return
      // const id = promiseData.id.toString()
      console.log('handleFetch')

      dispatch({ type: ActionTypesEnum.HandleLoading, payload: { seasonId } })
      try {
        const { data } = await getPromise(seasonNum)
        // const newData = {...data}
        console.log({ data })
        const episodes = [...data[`season/${seasonNum}`].episodes].reverse()

        console.log(episodes === data[`season/${seasonNum}`].episodes)
        // const episodesReverse = data[`season/${seasonNum}`].episodes.reverse()

        // newData[`season/${seasonNum}`] = episodes
        dispatch({
          type: ActionTypesEnum.HandleSuccess,
          payload: { seasonId, data: { seasonId, episodes } },
        })
      } catch (error) {
        console.log({ error })
        if (axios.isCancel(error)) return
        dispatch({ type: ActionTypesEnum.HandleFailure, payload: { seasonId } })
      }
    },
    [getPromise],
  )

  useEffect(() => {
    // handleFetch()
  }, [handleFetch])

  return { state, handleFetch }
}

export default useFetchSeasons
