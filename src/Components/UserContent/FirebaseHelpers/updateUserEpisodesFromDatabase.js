import { combineMergeObjects, releasedEpisodesToOneArray } from "Utils"
import mergeEpisodesWithAirDate from "Utils/mergeEpisodesWithAirDate"
import merge from "deepmerge"

const updateUserEpisodesFromDatabase = ({ firebase, authUser, shows }) => {
  return firebase.userEpisodes(authUser.uid).once("value", (snapshot) => {
    const showsEpisodes = Object.values(snapshot.val()).map((show) => {
      return show
    })

    console.log("merging on first load")
    console.log(shows)
    console.log(showsEpisodes)

    if (shows.length !== showsEpisodes.length) return

    console.log("fffffffff")

    const mergedShowsEpisodes = merge(shows, showsEpisodes, {
      arrayMerge: combineMergeObjects
    })

    mergedShowsEpisodes.forEach((show) => {
      const seasons = show.episodes.reduce((acc, season) => {
        const episodes = season.episodes.reduce((acc, episode) => {
          acc.push({ userRating: episode.userRating || 0, watched: episode.watched || false })
          return acc
        }, [])
        acc.push({
          episodes,
          season_number: season.season_number,
          userRating: season.userRating || 0
        })
        return acc
      }, [])

      const statusDatabase = show.status === "Ended" || show.status === "Canceled" ? "ended" : "ongoing"

      const releasedEpisodes = releasedEpisodesToOneArray({ data: show.episodes })
      const allEpisodes = seasons.reduce((acc, item) => {
        acc.push(...item.episodes)
        return acc
      }, [])
      allEpisodes.splice(releasedEpisodes.length)

      const episodesWithAirDate = mergeEpisodesWithAirDate({
        fullData: show.episodes,
        userData: seasons
      })

      const allEpisodesWatched = !allEpisodes.some((episode) => !episode.watched)
      const finished = statusDatabase === "ended" && allEpisodesWatched ? true : false

      firebase.userShowAllEpisodes(authUser.uid, show.id).set(seasons)

      firebase.userShowAllEpisodesInfo(authUser.uid, show.id).update({
        allEpisodesWatched,
        finished
      })

      firebase.userShow({ uid: authUser.uid, key: show.id }).update({ finished, allEpisodesWatched })

      firebase
        .userShowAllEpisodesNotFinished(authUser.uid, show.id)
        .set(allEpisodesWatched || show.database !== "watchingShows" ? null : episodesWithAirDate)
    })
  })
}

export default updateUserEpisodesFromDatabase
