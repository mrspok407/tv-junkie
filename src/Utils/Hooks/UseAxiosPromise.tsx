import { useCallback } from 'react'
import axios from 'axios'
import { tmdbTvSeasonURL } from 'Utils/APIUrls'
import useMemoized from './UseMemoized'

type Props = {
  showId: number
}

const useAxiosPromise = ({ showId }: Props) => {
  const axiosGet = (url: string) => axios.get(url)

  const memoizedCallback = useMemoized<Promise<any>, string>({ callback: axiosGet })

  const getPromise = useCallback(
    (seasonNum: number) => {
      const url = tmdbTvSeasonURL({ showId, seasonNum })!
      const promise = memoizedCallback(url)
      return promise
    },
    [showId, memoizedCallback],
  )

  return getPromise
}

export default useAxiosPromise
