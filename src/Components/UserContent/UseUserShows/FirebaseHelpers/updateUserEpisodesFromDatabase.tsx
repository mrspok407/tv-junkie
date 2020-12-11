import { releasedEpisodesToOneArray } from "Utils"
import mergeWith from "lodash.mergewith"
import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"
import { SingleEpisodeInterface, UserShowsInterface } from "../UseUserShows"

interface Arguments {
  firebase: FirebaseInterface
  authUser: AuthUserInterface
  showsFullInfo: UserShowsInterface[]
}

const updateUserEpisodesFromDatabase = ({ firebase, authUser, showsFullInfo }: Arguments) => {
  console.log("updateUserEp")
  return firebase.userEpisodes(authUser.uid).once("value", (snapshot: { val: () => { key: UserShowsInterface } }) => {
    if (snapshot.val() === null) return
    const userShowsEpisodes = Object.values(snapshot.val()).map((show) => show)

    if (showsFullInfo.length !== userShowsEpisodes.length) return

    const mergeCustomizer = (objValue: any, srcValue: any, key: any) => {
      if (key === "air_date") {
        return objValue === undefined ? "" : objValue
      }
      return undefined
    }
    const mergedShowsEpisodes: UserShowsInterface[] = mergeWith(showsFullInfo, userShowsEpisodes, mergeCustomizer)

    mergedShowsEpisodes.forEach((show) => {
      const seasons = show.episodes.reduce((acc: any, season) => {
        if (!season.id) return acc
        const episodes = season.episodes.reduce((acc: SingleEpisodeInterface[], episode) => {
          if (!episode.id) return acc
          acc.push({
            userRating: episode.userRating || 0,
            watched: episode.air_date ? episode.watched || false : false,
            air_date: episode.air_date || ""
          })
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

      const releasedEpisodes: SingleEpisodeInterface[] = releasedEpisodesToOneArray({ data: show.episodes })
      const allEpisodes = seasons.reduce((acc: SingleEpisodeInterface[], item: any) => {
        acc.push(...item.episodes)
        return acc
      }, [])
      allEpisodes.splice(releasedEpisodes.length)

      const allEpisodesWatched = !allEpisodes.some((episode: any) => !episode.watched)
      const finished = statusDatabase === "ended" && allEpisodesWatched ? true : false

      firebase.userShowAllEpisodes(authUser.uid, show.id).set(seasons)

      firebase.userShowAllEpisodesInfo(authUser.uid, show.id).update({
        allEpisodesWatched,
        finished,
        isAllWatched_database: `${allEpisodesWatched}_${show.database}`
      })

      firebase.userShow({ uid: authUser.uid, key: show.id }).update({ finished, allEpisodesWatched })
    })
  })
}

export default updateUserEpisodesFromDatabase
