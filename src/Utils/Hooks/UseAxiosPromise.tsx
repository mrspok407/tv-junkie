import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import useMemoized from './UseMemoized'
import { tmdbTvSeasonURL } from 'Utils/APIUrls'

const { CancelToken } = require('axios')

let cancelRequest: any

type Props = {
  // content: {
  //   url: string | undefined
  //   id: number | string
  //   seasonNum: number
  // }
  showId: number
  fullRerenderDeps: number | string
}

const useAxiosPromise = ({ showId, fullRerenderDeps }: Props) => {
  // const [promiseData, setPromiseData] = useState<{ promise: Promise<any>; id: number | string; seasonNum: number }>()

  const axiosGet = (url: string) =>
    axios.get(url, {
      cancelToken: new CancelToken((c: any) => {
        cancelRequest = c
      }),
    })

  const memoizedCallback = useMemoized<Promise<any>, string>({ deps: [fullRerenderDeps], callback: axiosGet })

  const getPromise = useCallback(
    (seasonNum: number) => {
      const url = tmdbTvSeasonURL({ showId, seasonNum })!
      const promise = memoizedCallback(url)
      return promise
    },
    [showId, memoizedCallback],
  )

  // useEffect(() => {
  //   if (content.url === undefined) return
  //   const promise = memoizedCallback(content.url)
  //   setPromiseData({
  //     promise,
  //     id: content.id,
  //     seasonNum: content.seasonNum,
  //   })
  // }, [content.id, memoizedCallback]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => () => {
      if (cancelRequest !== undefined) cancelRequest()
    },
    [fullRerenderDeps],
  )

  return getPromise
}

export default useAxiosPromise
