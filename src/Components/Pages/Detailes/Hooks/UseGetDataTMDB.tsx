import { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
import { DataTMDBAPIInterface, DATA_TMDBAPI_INITIAL } from 'Utils/Interfaces/DataTMDBAPIInterface'
import * as ROUTES from 'Utils/Constants/routes'
import * as _get from 'lodash.get'

const { CancelToken } = require('axios')

let cancelRequest: any

type Props = {
  id: string
  mediaType: string
}

const useGetDataTMDB = ({ id, mediaType }: Props) => {
  const history = useHistory()
  const [loading, setLoading] = useState(true)
  const [detailes, setDetailes] = useState<DataTMDBAPIInterface>(DATA_TMDBAPI_INITIAL)
  const [similarContent, setSimilarContent] = useState<DataTMDBAPIInterface[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const getContent = async () => {
      try {
        const { data } = await axios.get<DataTMDBAPIInterface>(
          `https://api.themoviedb.org/3/${mediaType === 'show' ? 'tv' : 'movie'}/${id}?api_key=${
            process.env.REACT_APP_TMDB_API
          }&language=en-US&append_to_response=${mediaType === 'show' ? 'similar' : 'similar_movies'}`,
          {
            cancelToken: new CancelToken((c: any) => {
              cancelRequest = c
            }),
          },
        )

        // const genreIds = data.genres && data.genres.length ? data.genres.map((item: { id: number }) => item.id) : '-'
        // const genreNames =
        //   data.genres && data.genres.length ? data.genres.map((item: { name: string }) => item.name).join(', ') : '-'
        // const networkNames =
        //   data.networks && data.networks.length
        //     ? data.networks.map((item: { name: string }) => item.name).join(', ')
        //     : '-'
        // const prodComp =
        //   data.production_companies.length === 0 || !data.production_companies ?
        //  '-' : data.production_companies[0].name

        const similarType: any = data.similar || data.similar_movies
        const similarContentData = similarType.results.filter((item: { poster_path: string }) => item.poster_path)
        const similarContentSortByVotes = similarContentData.sort(
          (a: { vote_count: number }, b: { vote_count: number }) => b.vote_count - a.vote_count,
        )

        setDetailes((prevState) => ({
          ...prevState,
          id: data.id,
          poster_path: data.poster_path,
          backdrop_path: data.backdrop_path,
          name: data.name || data.original_name,
          original_name: data.original_name,
          title: data.title || data.original_title,
          first_air_date: data.first_air_date,
          release_date: data.release_date,
          last_air_date: data.last_air_date,
          episode_run_time: data.episode_run_time,
          runtime: data.runtime,
          status: data.status,
          genres: data.genres,
          networks: data.networks,
          production_companies: data.production_companies,
          vote_average: data.vote_average,
          vote_count: data.vote_count,
          overview: data.overview,
          tagline: data.tagline,
          budget: data.budget,
          number_of_seasons: data.number_of_seasons,
          imdb_id: data.imdb_id,
          seasonsFromAPI: data.seasons ? data.seasons.reverse() : [],
        }))

        setLoading(false)
        setSimilarContent(similarContentSortByVotes)
      } catch (err) {
        const errorData: any = err
        if (axios.isCancel(errorData)) return
        if (_get(errorData.response, 'status', '') === 404) {
          history.push(ROUTES.PAGE_DOESNT_EXISTS)
          return
        }

        setError('Something went wrong, sorry. Try to reload the page.')
        setLoading(false)
      }
    }

    getContent()
    return () => {
      if (cancelRequest !== undefined) cancelRequest()
    }
  }, [mediaType, id, history])

  return [detailes, loading, similarContent, error] as [DataTMDBAPIInterface, boolean, DataTMDBAPIInterface[], string]
}

export default useGetDataTMDB
