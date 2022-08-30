/* eslint-disable max-len */
import axios from 'axios'
import { EpisodesTMDB, SingleEpisodeTMDB } from 'Utils/@TypesTMDB'

export interface ShowEpisodesTMDB {
  episodes: EpisodesTMDB[]
  showId: number
}

const getShowEpisodesTMDB = ({ id }: { id: number }) => {
  const promise = axios
    .get(`https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US`)
    .then(({ data: { number_of_seasons } }) => {
      const maxSeasonsInChunk = 20
      const allSeasons = []
      const seasonChunks = []
      const apiRequests: Promise<any>[] = []

      for (let i = 1; i <= number_of_seasons; i += 1) {
        allSeasons.push(`season/${i}`)
      }

      for (let i = 0; i <= allSeasons.length; i += maxSeasonsInChunk) {
        const chunk = allSeasons.slice(i, i + maxSeasonsInChunk)
        seasonChunks.push(chunk.join())
      }

      seasonChunks.forEach((season) => {
        apiRequests.push(
          axios.get(
            `https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.REACT_APP_TMDB_API}&append_to_response=${season}`,
          ),
        )
      })

      return axios.all([...apiRequests])
    })
    .then(
      axios.spread((...responses) => {
        const rowData: Record<string, unknown>[] = []
        const seasonsData: Record<string, unknown>[] = []

        responses.forEach((item) => {
          rowData.push(item.data)
        })

        const mergedRowData: { value: any } = Object.assign({}, ...rowData)

        Object.entries(mergedRowData).forEach(([key, value]) => {
          if (!key.indexOf('season/')) {
            seasonsData[value.season_number - 1] = { [key]: { ...value } }
          }
        })

        const allEpisodes: ShowEpisodesTMDB['episodes'] = []

        seasonsData.forEach((item: any, index) => {
          const season = item[`season/${index + 1}`]
          if (!Array.isArray(season.episodes) || season.episodes.length === 0) {
            return
          }

          const episodes: SingleEpisodeTMDB[] = []

          season.episodes.forEach((item: any) => {
            const updatedEpisode = {
              air_date: item.air_date || '',
              episode_number: item.episode_number || null,
              id: item.id,
              name: item.name || null,
              season_number: item.season_number || null,
            }
            episodes.push(updatedEpisode)
          })

          const updatedSeason = {
            air_date: season.air_date || '',
            episodes,
            id: season._id,
            name: season.name || null,
            poster_path: season.poster_path || null,
            season_number: season.season_number || null,
          }

          allEpisodes.push(updatedSeason)
        })

        const dataToPass: ShowEpisodesTMDB = {
          episodes: allEpisodes,
          showId: id,
        }
        return dataToPass
      }),
    )
    .catch((err) => {
      console.log({ err })
      return { episodes: [], showId: id }
    })

  return promise
}

export default getShowEpisodesTMDB
