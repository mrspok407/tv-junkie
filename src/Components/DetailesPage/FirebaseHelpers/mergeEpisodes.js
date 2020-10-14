import merge from "deepmerge"
import { combineMergeObjects } from "Utils"

const mergeEpisodes = ({ status, handleLoading, id, authUser, firebase, context, callback = () => {} }) => {
  if (!authUser) return

  const statusDatabase = status === "Ended" || status === "Canceled" ? "ended" : "ongoing"
  // if (context.userMergedShows.mergedShows.includes(id)) {
  //   callback({ status, handleLoading })
  //   return
  // }

  firebase
    .showInDatabase(statusDatabase, id)
    .once("value", (snapshot) => {
      console.log("merge")
      if (snapshot.val() === null) {
        handleLoading(false)
        return
      }

      const databaseEpisodes = snapshot.val().episodes

      firebase.userShowAllEpisodes(authUser.uid, id).once("value", (snapshot) => {
        if (snapshot.val() === null) {
          handleLoading(false)
          return
        }

        const userEpisodes = snapshot.val()

        let updatedSeasons = []
        let updatedSeasonsUser = []

        databaseEpisodes.forEach((season, indexSeason) => {
          const seasonPath = userEpisodes[indexSeason]
          const databaseEpisodes = season.episodes
          const episodes = seasonPath ? userEpisodes[indexSeason].episodes : []

          const mergedEpisodes = merge(databaseEpisodes, episodes, {
            arrayMerge: combineMergeObjects,
          })

          const updatedEpisodesUser = mergedEpisodes.reduce((acc, episode) => {
            acc.push({ watched: episode.watched || false, userRating: episode.userRating || 0 })
            return acc
          }, [])

          const updatedSeason = {
            ...season,
            episodes: mergedEpisodes,
          }

          const updatedSeasonUser = {
            season_number: season.season_number,
            episodes: updatedEpisodesUser,
            userRating: (seasonPath && seasonPath.userRating) || 0,
          }

          updatedSeasons.push(updatedSeason)
          updatedSeasonsUser.push(updatedSeasonUser)
        })

        firebase.userShowAllEpisodes(authUser.uid, id).set(updatedSeasonsUser, () => {
          callback({ status, handleLoading })
          context.userMergedShows.handleMergedShows(id)
        })
      })
    })
    .catch((err) => {
      console.log(err)
    })
}

export default mergeEpisodes
