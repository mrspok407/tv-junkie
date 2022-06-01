/* eslint-disable max-len */
import { useState, useEffect } from 'react'
import { DataTMDBAPIInterface } from 'Utils/Interfaces/DataTMDBAPIInterface'
import axios from 'axios'

const API_LINK_BASE = `https://api.themoviedb.org/3/discover/tv?api_key=${process.env.REACT_APP_TMDB_API}&\
language=en-US&page=1&sort_by=vote_count.desc&first_air_date.gte=&first_air_date.lte=&first_air_date_year=&vote_average.gte=&\
vote_count.gte=25&include_null_first_air_dates=false`

interface ObjectKeysInterface {
  [key: string]: {
    name: string
    data: DataTMDBAPIInterface[]
  }
}

const useGetSlidersContent = () => {
  const [sliders, setSliders] = useState<ObjectKeysInterface>({
    weekTvTrending: {
      name: 'Trending this week',
      data: [],
    },
    popularDramas: {
      name: 'Popular dramas',
      data: [],
    },
    popularComedies: {
      name: 'Popular comedies',
      data: [],
    },
    popularCrime: {
      name: 'Popular crime',
      data: [],
    },
  })
  const [slidersLoading, setSlidersLoading] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    const getContentForSliders = () => {
      setSlidersLoading(true)

      const weekTvTrending = axios.get(
        `https://api.themoviedb.org/3/trending/tv/week?api_key=${process.env.REACT_APP_TMDB_API}`,
      )
      const popularDramasPromise = axios.get(`${API_LINK_BASE}&with_genres=18&without_genres=16,35,9648`)
      const popularComediesPromise = axios.get(`${API_LINK_BASE}&with_genres=35&without_genres=16,18`)
      const popularCrimePromise = axios.get(`${API_LINK_BASE}&with_genres=80&without_genres=16,35,9648,10759,10765`)
      const promises = [weekTvTrending, popularDramasPromise, popularComediesPromise, popularCrimePromise]

      axios
        .all(promises)
        .then(
          axios.spread((...responses) => {
            const slidersTemp = responses.reduce((acc, value, index) => {
              const key = Object.keys(sliders)[index]
              acc = {
                ...acc,
                [key]: {
                  name: sliders[key].name,
                  data: value.data.results,
                },
              }
              return acc
            }, {})

            setSliders(slidersTemp)
            setSlidersLoading(false)
          }),
        )
        .catch((err) => {
          setError(`Something went wrong, sorry. ${err}`)
          setSlidersLoading(false)
        })
    }
    getContentForSliders()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { sliders, slidersLoading, error }
}

export default useGetSlidersContent
