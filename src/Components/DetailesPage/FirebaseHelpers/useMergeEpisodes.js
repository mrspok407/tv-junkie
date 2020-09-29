import { useState } from "react"
import axios from "axios"
import merge from "deepmerge"
import { combineMergeObjects } from "Utils"

const useMergeEpisodes = ({ detailes, id, authUser, firebase }) => {
  const [loading, setLoading] = useState(false)

  const mergeEpisodes = () => {
    if (!authUser || !detailes.numberOfSeasons) return

    const status = detailes.status === "Ended" || detailes.status === "Canceled" ? "ended" : "ongoing"

    firebase
      .allShowsList(status)
      .child(id)
      .once("value", snapshot => {
        if (snapshot.val() === null) return
        setLoading(true)

        const maxSeasonsInChunk = 20
        const allSeasons = []
        const seasonChunks = []
        const apiRequests = []

        for (let i = 1; i <= detailes.numberOfSeasons; i += 1) {
          allSeasons.push(`season/${i}`)
        }

        for (let i = 0; i <= allSeasons.length; i += maxSeasonsInChunk) {
          const chunk = allSeasons.slice(i, i + maxSeasonsInChunk)
          seasonChunks.push(chunk.join())
        }

        seasonChunks.forEach(item => {
          const request = axios.get(
            `https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.REACT_APP_TMDB_API}&append_to_response=${item}`
          )
          apiRequests.push(request)
        })

        axios
          .all([...apiRequests])
          .then(
            axios.spread((...responses) => {
              const rowData = []
              const seasonsData = []

              responses.forEach(item => {
                rowData.push(item.data)
              })

              const mergedRowData = Object.assign({}, ...rowData)

              Object.entries(mergedRowData).forEach(([key, value]) => {
                if (!key.indexOf("season/")) {
                  seasonsData.push({ [key]: { ...value } })
                }
              })

              const allEpisodes = []

              seasonsData.forEach((data, index) => {
                const season = data[`season/${index + 1}`]
                if (!Array.isArray(season.episodes) || season.episodes.length === 0) return

                const episodes = []

                season.episodes.forEach(item => {
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

              const dataToPass = {
                episodes: allEpisodes,
                status: mergedRowData.status
              }

              return dataToPass
            })
          )
          .then(data => {
            firebase
              .allShowsList(status)
              .child(id)
              .update({ episodes: data.episodes })
              .catch(err => {
                console.log(err)
              })

            firebase.userShowAllEpisodes(authUser.uid, id).once("value", snapshot => {
              if (snapshot.val() === null) {
                setLoading(false)
                return
              }

              const userEpisodes = snapshot.val()

              const databaseEpisodes = data.episodes

              let updatedSeasons = []
              let updatedSeasonsUser = []

              databaseEpisodes.forEach((season, indexSeason) => {
                const seasonPath = userEpisodes[indexSeason]
                const databaseEpisodes = season.episodes
                const episodes = seasonPath ? userEpisodes[indexSeason].episodes : []

                const mergedEpisodes = merge(databaseEpisodes, episodes, {
                  arrayMerge: combineMergeObjects
                })

                const updatedEpisodesUser = mergedEpisodes.reduce((acc, episode) => {
                  acc.push({ watched: episode.watched || false, userRating: episode.userRating || 0 })
                  return acc
                }, [])

                const updatedSeason = {
                  ...season,
                  episodes: mergedEpisodes
                }

                const updatedSeasonUser = {
                  season_number: season.season_number,
                  episodes: updatedEpisodesUser,
                  userRating: (seasonPath && seasonPath.userRating) || 0
                }

                updatedSeasons.push(updatedSeason)
                updatedSeasonsUser.push(updatedSeasonUser)
              })

              firebase.userShowAllEpisodes(authUser.uid, id).set(updatedSeasonsUser, () => setLoading(false))
            })
          })
      })
      .catch(err => {
        console.log(err)
        setLoading(false)
      })
  }

  return [loading, mergeEpisodes]
}

export default useMergeEpisodes
