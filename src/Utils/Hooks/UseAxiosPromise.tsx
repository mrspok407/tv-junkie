import { useState, useEffect, useCallback } from "react"
import useMemoized from "./UseMemoized"
import axios from "axios"

const { CancelToken } = require("axios")
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
  const memoizedCallback = useMemoized({ deps: [fullRerenderDeps] })

  const axiosGet = (url: string) => {
    return axios.get(url, {
      cancelToken: new CancelToken(function executor(c: any) {
        cancelRequest = c
      })
    })
  }

  const getPromise = useCallback(memoizedCallback(axiosGet), [fullRerenderDeps])

  useEffect(() => {
    if (content.url === undefined || disable) return
    const promise = getPromise(content.url)
    setPromiseData({
      promise,
      id: content.id,
      seasonNum: content.seasonNum
    })
  }, [content.id, disable, getPromise]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (cancelRequest !== undefined) cancelRequest()
    }
  }, [fullRerenderDeps])

  return promiseData
}

export default useAxiosPromise
