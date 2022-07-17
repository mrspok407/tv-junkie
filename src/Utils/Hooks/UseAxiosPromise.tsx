import { useEffect, useCallback } from 'react'
import axios from 'axios'
import { tmdbTvSeasonURL } from 'Utils/APIUrls'
import useMemoized from './UseMemoized'

const { CancelToken } = require('axios')

let cancelRequest: any

type Props = {
  showId: number
}

const useAxiosPromise = ({ showId }: Props) => {
  const axiosGet = (url: string) =>
    axios.get(url, {
      cancelToken: new CancelToken((c: any) => {
        cancelRequest = c
      }),
    })

  const memoizedCallback = useMemoized<Promise<any>, string>({ callback: axiosGet })

  const getPromise = useCallback(
    (seasonNum: number) => {
      const url = tmdbTvSeasonURL({ showId, seasonNum })!
      const promise = memoizedCallback(url)
      return promise
    },
    [showId, memoizedCallback],
  )

  useEffect(() => {
    return () => {
      if (cancelRequest !== undefined) cancelRequest()
    }
  }, [])

  return getPromise
}

export default useAxiosPromise
