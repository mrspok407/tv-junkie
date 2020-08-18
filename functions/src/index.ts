import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import axios from "axios"

admin.initializeApp()

const database = admin.database()
const config = functions.config()

export const updateDatabaseFromAPI = functions.pubsub
  .schedule("0 03 * * *")
  .timeZone("UTC")
  .onRun(context => {
    database
      .ref("allShowsList/ongoing")
      .once("value", snapshot => {
        if (snapshot.val() === null) return

        let shows: any[] = []
        snapshot.forEach(item => {
          shows = [...shows, item.val()]
        })

        shows.forEach(show => {
          axios
            .get(`https://api.themoviedb.org/3/tv/${show.id}?api_key=${config.api.tmdb}&language=en-US`)
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
                  `https://api.themoviedb.org/3/tv/${show.id}?api_key=${config.api.tmdb}&append_to_response=${item}`
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
                    seasonsData.push({ [key]: { ...(value as {}) } })
                  }
                })

                const allEpisodes: {
                  air_date: any
                  season_number: any
                  id: any
                  poster_path: any
                  name: any
                  episodes: any[]
                }[] = []

                seasonsData.forEach((data, index) => {
                  const season = data[`season/${index + 1}`]
                  if (!Array.isArray(season.episodes) || season.episodes.length === 0) return

                  const episodes: {
                    air_date: any
                    episode_number: any
                    name: any
                    season_number: any
                    id: any
                  }[] = []

                  season.episodes.forEach(
                    (item: {
                      air_date: any
                      episode_number: any
                      name: any
                      season_number: any
                      id: any
                    }) => {
                      const updatedEpisode = {
                        air_date: item.air_date,
                        episode_number: item.episode_number,
                        name: item.name,
                        season_number: item.season_number,
                        id: item.id
                      }
                      episodes.push(updatedEpisode)
                    }
                  )

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

                const dataToPass = {
                  episodes: allEpisodes,
                  status: mergedRowData.status
                }

                return dataToPass
              })
            )
            .then(data => {
              database
                .ref("allShowsList/ongoing")
                .child(show.id)
                .update({ episodes: data.episodes })
                .catch(err => {
                  console.log(err)
                })
            })
            .catch(err => {
              console.log(err)
            })
        })
      })
      .catch(err => {
        console.log(err)
      })
    return
  })
