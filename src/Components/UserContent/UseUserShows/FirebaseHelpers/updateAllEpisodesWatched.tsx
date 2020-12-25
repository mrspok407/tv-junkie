import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"
import { releasedEpisodesToOneArray } from "Utils"
import { SingleEpisodeInterface } from "../UseUserShows"

export interface UpdateAllEpisodesWatchedInterface {
  firebase: FirebaseInterface
  authUser: AuthUserInterface
  key: string | number
  info?: any
}

const updateAllEpisodesWatched = async ({ firebase, authUser, key }: UpdateAllEpisodesWatchedInterface) => {
  const isFinishedShowPromise = firebase
    .userShowAllEpisodesInfo(authUser.uid, key)
    .child("finished")
    .once("value")
    .then((snapshot: any) => snapshot.val())

  const isWatchingShowPromise = firebase
    .userShowAllEpisodesInfo(authUser.uid, key)
    .child("isAllWatched_database")
    .once("value")
    .then((snapshot: any) => snapshot.val())

  const [isFinishedShow, isWatchingShow] = await Promise.all([isFinishedShowPromise, isWatchingShowPromise])

  if (isFinishedShow || isWatchingShow !== "true_watchingShows") return

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
    return Promise.all([
      firebase.userShowAllEpisodesInfo(authUser.uid, key).update({
        allEpisodesWatched,
        isAllWatched_database: `${allEpisodesWatched}_watchingShows`
      }),
      firebase.userShow({ uid: authUser.uid, key }).update({ allEpisodesWatched })
    ])
  } else {
    const allEpisodesWatched = !releasedEpisodes.some((episode: any) => !episode.watched)

    return Promise.all([
      firebase.userShowAllEpisodesInfo(authUser.uid, key).update({
        allEpisodesWatched,
        isAllWatched_database: `${allEpisodesWatched}_watchingShows`
      }),
      firebase.userShow({ uid: authUser.uid, key }).update({ allEpisodesWatched })
    ])
  }
}

export default updateAllEpisodesWatched
