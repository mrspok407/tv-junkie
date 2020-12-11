import axios from "axios"

interface DataFromAPI {
  episodes: {}[]
  status: string
}

const getShowEpisodesFromAPI = ({ id }: { id: number }) => {
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

      seasonChunks.forEach((item) => {
        const request = axios.get(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.REACT_APP_TMDB_API}&append_to_response=${item}`
        )
        apiRequests.push(request)
      })

      return axios.all([...apiRequests])
    })
    .then(
      axios.spread((...responses) => {
        const rowData: {}[] = []
        const seasonsData: {}[] = []

        responses.forEach((item) => {
          rowData.push(item.data)
        })

        const mergedRowData: { value: {}; status: string } = Object.assign({}, ...rowData)

        Object.entries(mergedRowData).forEach(([key, value]) => {
          if (!key.indexOf("season/")) {
            seasonsData.push({ [key]: value })
          }
        })

        let allEpisodes: {}[] = []

        seasonsData.forEach((item: any, index) => {
          const season = item[`season/${index + 1}`]
          if (!Array.isArray(season.episodes) || season.episodes.length === 0) {
            return
          }

          let episodes: {}[] = []

          season.episodes.forEach((item: any) => {
            const updatedEpisode = {
              air_date: item.air_date,
              episode_number: item.episode_number,
              name: item.name,
              season_number: item.season_number,
              id: item.id
            }
            episodes.push(updatedEpisode)
          })

          const updatedSeason = {
            air_date: season.air_date,
            season_number: season.season_number,
            id: season._id,
            poster_path: season.poster_path,
            name: season.name,
            episodes
          }

          allEpisodes.push(updatedSeason)
        })

        const dataToPass: DataFromAPI = {
          episodes: allEpisodes,
          status: mergedRowData.status
        }

        console.log(dataToPass)

        return dataToPass
      })
    )
    .catch((err) => {
      console.log(err)
    })

  return promise
}

export default getShowEpisodesFromAPI
