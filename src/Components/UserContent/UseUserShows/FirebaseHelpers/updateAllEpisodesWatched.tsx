import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"
import { releasedEpisodesToOneArray } from "Utils"
import { SingleEpisodeInterface } from "../UseUserShows"

export interface UpdateAllEpisodesWatchedInterface {
  firebase: FirebaseInterface
  authUser: AuthUserInterface
  key: string | number
}

const updateAllEpisodesWatched = async ({ firebase, authUser, key }: UpdateAllEpisodesWatchedInterface) => {
  // // if (key !== "82684") return
  // // console.time("test")
  // const isFinishedShow = firebase
  //   .userShowAllEpisodesInfo(authUser.uid, key)
  //   .child("finished")
  //   .once("value")
  //   .then((snapshot: any) => snapshot.val())
  // // if (isFinishedShow) return

  // const isWatchingShow = firebase
  //   .userShowAllEpisodesInfo(authUser.uid, key)
  //   .child("isAllWatched_database")
  //   .once("value")
  //   .then((snapshot: any) => snapshot.val())
  // // if (isWatchingShow !== "true_watchingShows") return
  // const test = await Promise.all([isFinishedShow, isWatchingShow])
  // // console.timeEnd("test")
  // if (test[0] || test[1] !== "true_watchingShows") return

  // const lastTwoSeasonsData = await firebase
  //   .userShowAllEpisodes(authUser.uid, key)
  //   .orderByValue()
  //   .limitToLast(2)
  //   .once("value")
  //   .then((snapshot: any) => snapshot.val())

  // const userEpisodes = Object.values(lastTwoSeasonsData).map((item: any) => item)
  // const releasedEpisodes: SingleEpisodeInterface[] = releasedEpisodesToOneArray({
  //   data: userEpisodes
  // })

  // if (releasedEpisodes.length === 0) {
  //   const lastThreeSeasonsData = await firebase
  //     .userShowAllEpisodes(authUser.uid, key)
  //     .orderByValue()
  //     .limitToLast(3)
  //     .once("value")
  //     .then((snapshot: any) => snapshot.val())

  //   const userEpisodes = Object.values(lastThreeSeasonsData).map((item: any) => item)
  //   const releasedEpisodes: SingleEpisodeInterface[] = releasedEpisodesToOneArray({
  //     data: userEpisodes
  //   })
  //   const allEpisodesWatched = !releasedEpisodes.some((episode: any) => !episode.watched)
  //   return [
  //     firebase.userShowAllEpisodesInfo(authUser.uid, key).update({
  //       allEpisodesWatched,
  //       isAllWatched_database: `${allEpisodesWatched}_watchingShows`
  //     }),
  //     firebase.userShow({ uid: authUser.uid, key }).update({ allEpisodesWatched })
  //   ]
  // } else {
  //   const allEpisodesWatched = !releasedEpisodes.some((episode: any) => !episode.watched)

  //   return [
  //     firebase.userShowAllEpisodesInfo(authUser.uid, key).update({
  //       allEpisodesWatched,
  //       isAllWatched_database: `${allEpisodesWatched}_watchingShows`
  //     }),
  //     firebase.userShow({ uid: authUser.uid, key }).update({ allEpisodesWatched })
  //   ]
  // }

  return firebase
    .userShowAllEpisodesInfo(authUser.uid, key)
    .child("finished")
    .once("value", (snapshot: any) => {
      if (snapshot.val()) return
      return firebase
        .userShowAllEpisodesInfo(authUser.uid, key)
        .child("isAllWatched_database")
        .once("value", async (snapshot: any) => {
          if (snapshot.val() === "true_watchingShows") {
            const lastTwoSeasonsData = await firebase
              .userShowAllEpisodes(authUser.uid, key)
              .orderByValue()
              .limitToLast(2)
              .once("value")
              .then((snapshot: any) => snapshot.val())

            const userEpisodes = Object.values(lastTwoSeasonsData).map((item: any) => item)
            const releasedEpisodes: SingleEpisodeInterface[] = releasedEpisodesToOneArray({
              data: userEpisodes
            })

            if (releasedEpisodes.length === 0) {
              const lastThreeSeasonsData = await firebase
                .userShowAllEpisodes(authUser.uid, key)
                .orderByValue()
                .limitToLast(3)
                .once("value")
                .then((snapshot: any) => snapshot.val())

              const userEpisodes = Object.values(lastThreeSeasonsData).map((item: any) => item)
              const releasedEpisodes: SingleEpisodeInterface[] = releasedEpisodesToOneArray({
                data: userEpisodes
              })
              const allEpisodesWatched = !releasedEpisodes.some((episode: any) => !episode.watched)
              return [
                firebase.userShowAllEpisodesInfo(authUser.uid, key).update({
                  allEpisodesWatched,
                  isAllWatched_database: `${allEpisodesWatched}_watchingShows`
                }),
                firebase.userShow({ uid: authUser.uid, key }).update({ allEpisodesWatched })
              ]
            } else {
              const allEpisodesWatched = !releasedEpisodes.some((episode: any) => !episode.watched)

              return [
                firebase.userShowAllEpisodesInfo(authUser.uid, key).update({
                  allEpisodesWatched,
                  isAllWatched_database: `${allEpisodesWatched}_watchingShows`
                }),
                firebase.userShow({ uid: authUser.uid, key }).update({ allEpisodesWatched })
              ]
            }

            // return firebase
            //   .userShowAllEpisodes(authUser.uid, key)
            //   .orderByValue()
            //   .limitToLast(2)
            //   .once("value", (snapshot: any) => {
            //     const userEpisodes = Object.values(snapshot.val()).map((item: any) => item)
            //     const releasedEpisodes: SingleEpisodeInterface[] = releasedEpisodesToOneArray({
            //       data: userEpisodes
            //     })

            //     if (releasedEpisodes.length === 0) {
            //       return firebase
            //         .userShowAllEpisodes(authUser.uid, key)
            //         .orderByValue()
            //         .limitToLast(3)
            //         .once("value", (snapshot: any) => {
            //           const userEpisodes = Object.values(snapshot.val()).map((item: any) => item)
            //           const releasedEpisodes: SingleEpisodeInterface[] = releasedEpisodesToOneArray({
            //             data: userEpisodes
            //           })
            //           const allEpisodesWatched = !releasedEpisodes.some((episode: any) => !episode.watched)
            //           return [
            //             firebase.userShowAllEpisodesInfo(authUser.uid, key).update({
            //               allEpisodesWatched,
            //               isAllWatched_database: `${allEpisodesWatched}_watchingShows`
            //             }),
            //             firebase.userShow({ uid: authUser.uid, key }).update({ allEpisodesWatched })
            //           ]
            //         })
            //     } else {
            //       const allEpisodesWatched = !releasedEpisodes.some((episode: any) => !episode.watched)

            //       return [
            //         firebase.userShowAllEpisodesInfo(authUser.uid, key).update({
            //           allEpisodesWatched,
            //           isAllWatched_database: `${allEpisodesWatched}_watchingShows`
            //         }),
            //         firebase.userShow({ uid: authUser.uid, key }).update({ allEpisodesWatched })
            //       ]
            //     }
            //   })
          }
        })
    })
}

export default updateAllEpisodesWatched
