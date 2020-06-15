import * as functions from "firebase-functions"
import axios from "axios"

const config = functions.config()

export const onAddShow = functions.database
  .ref("users/{uid}/content/watchingShows/{showUid}")
  .onCreate((snapshot, context) => {
    // const userUid = context.params.uid
    // const showUid = context.params.showUid
    const showId = snapshot.val().id
    // let episodes = "test"
    return axios
      .get(`https://api.themoviedb.org/3/tv/${showId}?api_key=${config.api.tmdb}&language=en-US`)
      .then(({ data: { number_of_seasons } }) => {
        const maxSeasonsInChunk = 20
        const allSeasons = []
        const seasonChunks = []
        const apiRequests: Promise<import("axios").AxiosResponse<any>>[] = []

        for (let i = 1; i <= number_of_seasons; i += 1) {
          allSeasons.push(`season/${i}`)
        }

        for (let i = 0; i <= allSeasons.length; i += maxSeasonsInChunk) {
          const chunk = allSeasons.slice(i, i + maxSeasonsInChunk)
          seasonChunks.push(chunk.join())
        }

        seasonChunks.forEach(item => {
          const request = axios.get(
            `https://api.themoviedb.org/3/tv/${showId}?api_key=${config.api.tmdb}&append_to_response=${item}`
          )
          apiRequests.push(request)
        })

        return axios.all([...apiRequests])
      })
      .then(
        axios.spread((...responses) => {
          const rowData: any[] = []
          const seasonsData: { [x: string]: any }[] = []

          responses.forEach(item => {
            rowData.push(item.data)
          })

          const mergedRowData = Object.assign({}, ...rowData)

          Object.entries(mergedRowData).forEach(([key, value]) => {
            if (!key.indexOf("season/")) {
              const newKey = key.replace("/", "")
              seasonsData.push({ [newKey]: { ...(value as {}) } })
            }
          })

          console.log(seasonsData)
          return snapshot.ref.update({ episodes: seasonsData })
        })
      )
      .catch(err => {
        console.log(err)
      })
    // axios
    //   .get(`https://api.themoviedb.org/3/tv/${showId}/external_ids?api_key=${config.api.tmdb}&language=en-US`)
    //   .then(({ data: { imdb_id } }) => {
    //     return axios.get(`http://api.tvmaze.com/lookup/shows?imdb=${imdb_id}`)
    //   })
    //   .then(({ data: { id } }) => {
    //     return axios.get(`http://api.tvmaze.com/shows/${id}?embed=episodes`)
    //   })
    //   .then(({ data: { _embedded } }) => {
    //     const episodes = _embedded.episodes
    //     const modifiedEpisodes: any[][] = []
    //     const mapSeasons = new Map()

    //     const seasons = episodes.reduce((acc: any[], item: { season: any }) => {
    //       if (!mapSeasons.has(item.season)) {
    //         mapSeasons.set(item.season, true)
    //         acc.push(item.season)
    //       }
    //       return acc
    //     }, [])

    //     seasons.forEach((season: any) => {
    //       const seasonEpisodes: any[] = []

    //       episodes.forEach((episode: { season: any }) => {
    //         // if (episode.season === season) seasonEpisodes.unshift({ ...episode, watched: false })
    //         if (episode.season === season) seasonEpisodes.push({ ...episode, watched: false })
    //       })
    //       modifiedEpisodes.push(seasonEpisodes)
    //     })

    //     // const episodes = _embedded.episodes
    //     // console.log(episodes)
    //     return snapshot.ref.update({ episodes: modifiedEpisodes })
    //   })
    //   .catch(err => {
    //     console.log(err)
    //   })
  })
