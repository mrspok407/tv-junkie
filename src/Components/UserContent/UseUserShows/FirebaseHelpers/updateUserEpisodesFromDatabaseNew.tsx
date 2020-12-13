import { releasedEpisodesToOneArray } from "Utils"
import mergeWith from "lodash.mergewith"
import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"
import { SeasonEpisodesFromDatabaseInterface, SingleEpisodeInterface, UserShowsInterface } from "../UseUserShows"

interface Arguments {
  firebase: FirebaseInterface
}

const updateUserEpisodesFromDatabase = async ({ firebase }: Arguments) => {
  const authUser = firebase.auth.currentUser

  console.time("getKeys")

  const showsLastUpdateList = await firebase
    .userShowsLastUpdateList(authUser.uid)
    .once("value")
    .then((snapshot: any) => snapshot.val())

  const showsToUpdate = await Promise.all(
    Object.entries(showsLastUpdateList).map(async (show: any) => {
      const lastUpdatedInDatabase = await firebase
        .showInfo(show[0])
        .child("lastUpdatedInDatabase")
        .once("value")
        .then((snapshot: any) => snapshot.val())
      // return (lastUpdatedInDatabase > show.lastUpdatedInUser || !show.lastUpdatedInUser) && show.id
      if (lastUpdatedInDatabase > show[1].lastUpdatedInUser) {
        return show[0]
      }
    })
  )

  console.log({ showsToUpdate })

  Promise.all([
    Promise.all(
      showsToUpdate.reduce((acc: any, show: any) => {
        if (show !== undefined) {
          return [
            ...acc,
            firebase
              .userShowEpisodes(authUser.uid, show)
              .once("value")
              .then((snapshot: any) => {
                return snapshot.val()
              })
          ]
        }
        return acc
      }, [])
    ),
    Promise.all(
      showsToUpdate.reduce((acc: any, show: any) => {
        if (show !== undefined) {
          return [
            ...acc,
            firebase
              .showInDatabase(show)
              .once("value")
              .then((snapshot: any) => {
                return { ...snapshot.val().info, episodes: snapshot.val().episodes }
              })
          ]
        }
        return acc
      }, [])
    )
  ]).then((data: any) => {
    const userShows = data[0]
    const showsFromDatabase = data[1]

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
    const mergedShowsEpisodes: UserShowsInterface[] = mergeWith(showsFromDatabase, userShows, mergeCustomizer)
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

      console.log({ show })

      promises = [
        ...promises,
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

    return Promise.all(promises)
  })

  console.timeEnd("getKeys")

  // firebase
  //   .showInfo(key)
  //   .child("lastUpdatedInDatabase")
  //   .once("value")
  //   .then((snapshot: any) => snapshot.val())
  // const lastUpdatedInUser = await firebase
  //   .userShow(key)
  //   .child("lastUpdatedInUser")
  //   .once("value")
  //   .then((snapshot: any) => snapshot.val())
  // return lastUpdatedInDatabase > lastUpdatedInUser || lastUpdatedInUser === undefined

  // return (
  //   Promise.all(
  //     showsKeys.map((show: any) => {
  //       return firebase
  //         .userShowEpisodes(authUser.uid, show.id)
  //         .once("value")
  //         .then((snapshot: any) => {
  //           return snapshot.val()
  //         })
  //     })
  //   )
  //     // .then((snapshot: { val: () => { key: UserShowsInterface } }) => {
  //     .then((episodes: any) => {
  //       console.log({ watchingShowsFromDB })
  //       console.log({ episodes })
  //       // console.log(snapshot.val())
  //       // if (snapshot.val() === null) return
  //       const userShowsEpisodes = Object.values(episodes).map((show) => show)

  //       if (watchingShowsFromDB.length !== userShowsEpisodes.length) return
  //       const mergeCustomizer = (objValue: any, srcValue: any, key: any) => {
  //         if (key === "air_date") {
  //           // console.log({ objValue })
  //           // console.log({ srcValue })
  //           return objValue === undefined ? "" : objValue
  //           // return undefined
  //         } else if (key === "season_number") {
  //           return objValue
  //         }
  //         return undefined
  //       }
  //       console.log({ watchingShowsFromDB })
  //       console.log({ userShowsEpisodes })
  //       const mergedShowsEpisodes: UserShowsInterface[] = mergeWith(
  //         watchingShowsFromDB,
  //         userShowsEpisodes,
  //         mergeCustomizer
  //       )
  //       console.log({ mergedShowsEpisodes })

  //       let promises: any = []

  //       mergedShowsEpisodes.forEach((show) => {
  //         const seasons = show.episodes.reduce((acc: any, season) => {
  //           // if (!season.season_number) return acc
  //           const episodes = season.episodes.reduce((acc: SingleEpisodeInterface[], episode) => {
  //             // if (!episode.id) return acc
  //             acc.push({
  //               userRating: episode.userRating || 0,
  //               watched: episode.air_date ? episode.watched || false : false,
  //               // watched: episode.watched || false,
  //               air_date: episode.air_date || ""
  //             })
  //             return acc
  //           }, [])
  //           acc.push({
  //             episodes,
  //             season_number: season.season_number,
  //             userRating: season.userRating || 0
  //           })
  //           return acc
  //         }, [])

  //         const statusDatabase = show.status === "Ended" || show.status === "Canceled" ? "ended" : "ongoing"

  //         const releasedEpisodes: SingleEpisodeInterface[] = releasedEpisodesToOneArray({ data: show.episodes })
  //         const allEpisodes = seasons.reduce((acc: SingleEpisodeInterface[], item: any) => {
  //           acc.push(...item.episodes)
  //           return acc
  //         }, [])
  //         allEpisodes.splice(releasedEpisodes.length)

  //         const allEpisodesWatched = !allEpisodes.some((episode: any) => !episode.watched)
  //         const finished = statusDatabase === "ended" && allEpisodesWatched ? true : false

  //         promises = [
  //           ...promises,
  //           firebase.userShowAllEpisodes(authUser.uid, show.id).set(seasons),
  //           firebase.userShowAllEpisodesInfo(authUser.uid, show.id).update({
  //             allEpisodesWatched,
  //             finished,
  //             isAllWatched_database: `${allEpisodesWatched}_${show.database}`
  //           }),
  //           firebase
  //             .userShow({ uid: authUser.uid, key: show.id })
  //             .update({ finished, allEpisodesWatched, lastUpdatedInUser: firebase.timeStamp() })
  //         ]
  //       })

  //       return Promise.all(promises)
  //     })
  // )
}

export default updateUserEpisodesFromDatabase
