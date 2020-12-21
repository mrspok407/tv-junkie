import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"
import { releasedEpisodesToOneArray } from "Utils"
import { SingleEpisodeInterface } from "../UseUserShows"

interface UpdateAllEpisodesWatchedInterface {
  firebase: FirebaseInterface
  authUser: AuthUserInterface
  key: string
}

const updateAllEpisodesWatched = ({ firebase, authUser, key }: UpdateAllEpisodesWatchedInterface) => {
  return firebase
    .userShowAllEpisodesInfo(authUser.uid, key)
    .child("finished")
    .once("value", async (snapshot: any) => {
      if (snapshot.val()) return
      return firebase
        .userShowAllEpisodesInfo(authUser.uid, key)
        .child("isAllWatched_database")
        .once("value", (snapshot: any) => {
          if (snapshot.val() === "true_watchingShows") {
            return firebase
              .userShowAllEpisodes(authUser.uid, key)
              .orderByValue()
              .limitToLast(1)
              .once("value", (snapshot: any) => {
                const userEpisodes = Object.values(snapshot.val()).map((item: any) => item)
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
              })
          }
        })
    })
}

export default updateAllEpisodesWatched
