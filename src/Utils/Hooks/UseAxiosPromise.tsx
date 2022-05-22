import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import useMemoized from './UseMemoized'

const { CancelToken } = require('axios')

let cancelRequest: any

type Props = {
  content: {
    url: string | undefined
    id: number | string
    seasonNum: number
  }
  fullRerenderDeps: number | string
  disable: boolean
}

const useAxiosPromise = ({ content, fullRerenderDeps, disable }: Props) => {
  const [promiseData, setPromiseData] = useState<{ promise: Promise<any>; id: number | string; seasonNum: number }>()

  const axiosGet = (url: string) => axios.get(url, {
      cancelToken: new CancelToken((c: any) => {
        cancelRequest = c
      }),
    })

  const memoizedCallback = useMemoized<Promise<any>, string>({ deps: [fullRerenderDeps], callback: axiosGet })

  useEffect(() => {
    if (content.url === undefined || disable) return
    const promise = memoizedCallback(content.url)
    setPromiseData({
      promise,
      id: content.id,
      seasonNum: content.seasonNum,
    })
  }, [content.id, disable, memoizedCallback]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => {
      if (cancelRequest !== undefined) cancelRequest()
    }, [fullRerenderDeps])

  return promiseData
}

export default useAxiosPromise
