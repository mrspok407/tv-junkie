import { useContext, useState } from "react"
import { FirebaseContext } from "Components/Firebase"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"
import { SeasonEpisodesFromDatabaseInterface } from "./UseUserShows"
import { releasedEpisodesToOneArray } from "Utils"

type Hook = () => {
  userToWatchShows: UserToWatchShowsInterface[]
  loadingNotFinishedShows: boolean
  listenerUserToWatchShow: (authUser: AuthUserInterface) => void
}

export interface UserToWatchShowsInterface {
  id: number
  name?: string
  original_name?: string
  episodes: SeasonEpisodesFromDatabaseInterface[]
}

const useGetUserToWatchShows: Hook = () => {
  const [userToWatchShows, setUserToWatchShows] = useState<UserToWatchShowsInterface[]>([])
  const [loadingNotFinishedShows, setLoadingNotFinishedShows] = useState(true)
  const firebase = useContext(FirebaseContext)

  const listenerUserToWatchShow = (authUser: AuthUserInterface) => {
    firebase
      .userEpisodes(authUser.uid)
      .orderByChild("info/isAllWatched_database")
      .equalTo("false_watchingShows")
      .on("value", (snapshot: { val: () => { id: number; episodes: {}[] } }) => {
        if (snapshot.val() === null) {
          setUserToWatchShows([])
          setLoadingNotFinishedShows(false)
          return
        }

        console.log("userToWatchShows")

        const userEpisodes: UserToWatchShowsInterface[] = Object.entries(snapshot.val()).reduce(
          (acc: UserToWatchShowsInterface[], [key, value]: any) => {
            const releasedEpisodes: { watched: boolean }[] = releasedEpisodesToOneArray({
              data: value.episodes
            })

            if (releasedEpisodes.find((episode) => !episode.watched)) {
              acc.push({ id: Number(key), episodes: value.episodes })
            }
            return acc
          },
          []
        )

        setUserToWatchShows(userEpisodes)
        setLoadingNotFinishedShows(false)
      })
  }

  return {
    userToWatchShows,
    loadingNotFinishedShows,
    listenerUserToWatchShow
  }
}

export default useGetUserToWatchShows
