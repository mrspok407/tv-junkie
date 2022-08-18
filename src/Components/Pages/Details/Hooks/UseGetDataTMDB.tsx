import { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
import { MainDataTMDB, MAINDATA_TMDB_INITIAL } from 'Utils/@TypesTMDB'
import * as ROUTES from 'Utils/Constants/routes'

const { CancelToken } = require('axios')

let cancelRequest: any

type Props = {
  id: string
  mediaType: string
}

export const fetchContentDetailsTMDB = async ({ mediaType, id }: { mediaType: string; id: string | number }) => {
  const { data } = await axios.get<MainDataTMDB>(
    `https://api.themoviedb.org/3/${mediaType === 'show' ? 'tv' : 'movie'}/${id}?api_key=${
      process.env.REACT_APP_TMDB_API
    }&language=en-US&append_to_response=${mediaType === 'show' ? 'similar' : 'similar_movies'}`,
    {
      cancelToken: new CancelToken((c: any) => {
        cancelRequest = c
      }),
    },
  )

  console.log({ data })

  return {
    ...data,
    backdrop_path: data.backdrop_path,
    budget: data.budget,
    episode_run_time: data.episode_run_time,
    first_air_date: data.first_air_date,
    genres: data.genres,
    id: data.id,
    imdb_id: data.imdb_id,
    last_air_date: data.last_air_date,
    name: data.name || data.original_name,
    networks: data.networks,
    number_of_seasons: data.number_of_seasons,
    original_name: data.original_name,
    overview: data.overview,
    poster_path: data.poster_path,
    production_companies: data.production_companies,
    release_date: data.release_date,
    runtime: data.runtime,
    seasons: data.seasons ? data.seasons.reverse() : [],
    status: data.status,
    tagline: data.tagline,
    title: data.title || data.original_title,
    vote_average: data.vote_average,
    vote_count: data.vote_count,
    similar: data.similar,
    similar_movies: data.similar_movies,
  }
}

const useGetDataTMDB = ({ id, mediaType }: Props) => {
  const history = useHistory()
  const [loading, setLoading] = useState(false)
  const [details, setDetails] = useState<MainDataTMDB>(MAINDATA_TMDB_INITIAL)
  const [similarContent, setSimilarContent] = useState<MainDataTMDB[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const getContent = async () => {
      setLoading(true)
      try {
        const data = await fetchContentDetailsTMDB({ mediaType, id })

        const similarType: any = data.similar || data.similar_movies
        const similarContentData = similarType.results.filter((item: { poster_path: string }) => item.poster_path)
        const similarContentSortByVotes = similarContentData.sort(
          (a: { vote_count: number }, b: { vote_count: number }) => b.vote_count - a.vote_count,
        )

        setDetails(data)
        setSimilarContent(similarContentSortByVotes)
      } catch (err) {
        const errorData: any = err
        if (axios.isCancel(errorData)) return
        if (errorData?.response?.status === 404) {
          history.push(ROUTES.PAGE_DOESNT_EXISTS)
          return
        }
        setError('Something went wrong, sorry. Try to reload the page.')
      } finally {
        setLoading(false)
      }
    }

    getContent()
    return () => {
      if (cancelRequest !== undefined) cancelRequest()
    }
  }, [mediaType, id, history])

  return [details, loading, similarContent, error] as [MainDataTMDB, boolean, MainDataTMDB[], string]
}

export default useGetDataTMDB
