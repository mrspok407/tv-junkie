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
  const watchingShowsFromDB = showsFullInfo.filter((item: any) => item.database === "watchingShows" && !item.finished)

  // return firebase
  //   .userEpisodes(authUser.uid)
  //   .orderByChild("info/isAllWatched_database")
  //   .equalTo("false_watchingShows")
  //   .once("value")

  // firebase
  // .userEpisodes(authUser.uid)
  // .orderByChild("info/isAllWatched_database")
  // .equalTo("false_watchingShows")
  // .once("value")
  // .then(() => {
  //   return
  // })
  return (
    Promise.all(
      watchingShowsFromDB.map((show: any) => {
        return firebase
          .userShowEpisodes(authUser.uid, show.id)
          .once("value")
          .then((snapshot: any) => {
            return snapshot.val()
          })
      })
    )
      // .then((snapshot: { val: () => { key: UserShowsInterface } }) => {
      .then((episodes: any) => {
        console.log({ watchingShowsFromDB })
        console.log({ episodes })
        // console.log(snapshot.val())
        // if (snapshot.val() === null) return
        const userShowsEpisodes = Object.values(episodes).map((show) => show)

        if (watchingShowsFromDB.length !== userShowsEpisodes.length) return
        const mergeCustomizer = (objValue: any, srcValue: any, key: any) => {
          if (key === "air_date") {
            // console.log({ objValue })
            // console.log({ srcValue })
            return objValue === undefined ? "" : objValue
            // return undefined
          } else if (key === "season_number") {
            return objValue
          }
          return undefined
        }
        console.log({ watchingShowsFromDB })
        console.log({ userShowsEpisodes })
        const mergedShowsEpisodes: UserShowsInterface[] = mergeWith(
          watchingShowsFromDB,
          userShowsEpisodes,
          mergeCustomizer
        )
        console.log({ mergedShowsEpisodes })

        let promises: any = []

        mergedShowsEpisodes.forEach((show) => {
          const seasons = show.episodes.reduce((acc: any, season) => {
            // if (!season.season_number) return acc
            const episodes = season.episodes.reduce((acc: SingleEpisodeInterface[], episode) => {
              // if (!episode.id) return acc
              acc.push({
                userRating: episode.userRating || 0,
                watched: episode.air_date ? episode.watched || false : false,
                // watched: episode.watched || false,
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

          promises = [
            ...promises,
            firebase.userShowAllEpisodes(authUser.uid, show.id).set(seasons),
            firebase.userShowAllEpisodesInfo(authUser.uid, show.id).update({
              allEpisodesWatched,
              finished,
              isAllWatched_database: `${allEpisodesWatched}_${show.database}`
            }),
            firebase.userShow({ uid: authUser.uid, key: show.id }).update({ finished, allEpisodesWatched })
          ]
        })

        return Promise.all(promises)
      })
  )
}

export default updateUserEpisodesFromDatabase
