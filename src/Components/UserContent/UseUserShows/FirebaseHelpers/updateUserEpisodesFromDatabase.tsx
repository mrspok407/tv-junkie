import { releasedEpisodesToOneArray } from "Utils"
import mergeWith from "lodash.mergewith"
import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import { SeasonEpisodesFromDatabaseInterface, SingleEpisodeInterface, UserShowsInterface } from "../UseUserShows"

interface Arguments {
  firebase: FirebaseInterface
}

const updateUserEpisodesFromDatabase = async ({ firebase }: Arguments) => {
  const authUser = firebase.auth.currentUser

  const showsLastUpdateList = await firebase
    .userShowsLastUpdateList(authUser.uid)
    .once("value")
    .then((snapshot: any) => snapshot.val())

  if (!showsLastUpdateList) return

  const showsToUpdate: string[] = await Promise.all(
    Object.entries(showsLastUpdateList).map(async ([key, value]: any) => {
      const lastUpdatedInDatabase = await firebase
        .showInfo(key)
        .child("lastUpdatedInDatabase")
        .once("value")
        .then((snapshot: any) => snapshot.val())
      if (lastUpdatedInDatabase > value.lastUpdatedInUser) {
        return key
      }
    })
  ).then((data) => data.filter((item) => item !== undefined))

  if (showsToUpdate.length === 0) return

  Promise.all([
    Promise.all(
      showsToUpdate.map((show) =>
        firebase
          .userShowEpisodes(authUser.uid, show)
          .once("value")
          .then((snapshot: { val: () => SeasonEpisodesFromDatabaseInterface[] }) => {
            return snapshot.val()
          })
      )
    ),
    Promise.all(
      showsToUpdate.map((show) =>
        firebase
          .showInDatabase(show)
          .once("value")
          .then((snapshot: { val: () => { info: {}; episodes: SeasonEpisodesFromDatabaseInterface[] } }) => {
            return { ...snapshot.val().info, episodes: snapshot.val().episodes }
          })
      )
    )
  ]).then((data) => {
    const userShows = data[0]
    const showsFromDatabase = data[1]

    const mergeCustomizer = (objValue: any, srcValue: any, key: any) => {
      if (key === "air_date") {
        return objValue === undefined ? "" : objValue
      } else if (key === "season_number") {
        return objValue
      }
      return undefined
    }
    const mergedShowsEpisodes: UserShowsInterface[] = mergeWith(showsFromDatabase, userShows, mergeCustomizer)

    let userShowsPromises: any = []

    mergedShowsEpisodes.forEach((show) => {
      const seasons = show.episodes.reduce((acc: any, season) => {
        const episodes = season.episodes.reduce((acc: SingleEpisodeInterface[], episode) => {
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

      userShowsPromises = [
        ...userShowsPromises,
        firebase.userShow({ uid: authUser.uid, key: show.id }).update({ finished, allEpisodesWatched })
      ]

      firebase.userShowAllEpisodes(authUser.uid, show.id).set(seasons)
      firebase.userShowAllEpisodesInfo(authUser.uid, show.id).update({
        allEpisodesWatched,
        finished,
        isAllWatched_database: `${allEpisodesWatched}_${show.info.database}`
      })
      firebase.userShowsLastUpdateList(authUser.uid).child(show.id).update({ lastUpdatedInUser: firebase.timeStamp() })
    })

    return Promise.all(userShowsPromises)
  })
}

export default updateUserEpisodesFromDatabase