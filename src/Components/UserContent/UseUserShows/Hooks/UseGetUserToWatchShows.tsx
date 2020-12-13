import { useContext, useEffect, useState } from "react"
import { FirebaseContext } from "Components/Firebase"
import { SeasonEpisodesFromDatabaseInterface } from "../UseUserShows"
import { releasedEpisodesToOneArray } from "Utils"
import useAuthUser from "Components/UserAuth/Session/WithAuthentication/UseAuthUser"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"

type Hook = () => {
  userToWatchShows: UserToWatchShowsInterface[]
  loadingNotFinishedShows: boolean
  listenerUserToWatchShow: ({ uid }: AuthUserInterface) => void
  resetStateToWatchShows: () => void
}

export interface UserToWatchShowsInterface {
  id: number
  episodes: SeasonEpisodesFromDatabaseInterface[]
}

export interface UserToWatchTest {}

const useGetUserToWatchShows: Hook = () => {
  const [userToWatchShows, setUserToWatchShows] = useState<UserToWatchShowsInterface[]>([])
  const [loadingNotFinishedShows, setLoadingNotFinishedShows] = useState(true)
  const firebase = useContext(FirebaseContext)
  const authUser = useAuthUser()

  useEffect(() => {
    return () => {
      if (!authUser) return

      firebase
        .userEpisodes(authUser.uid)
        .orderByChild("info/isAllWatched_database")
        .equalTo("false_watchingShows")
        .off()
    }
  }, [firebase, authUser])

  const listenerUserToWatchShow = ({ uid }: AuthUserInterface) => {
    firebase
      .userEpisodes(uid)
      .orderByChild("info/isAllWatched_database")
      .equalTo("false_watchingShows")
      .on("value", (snapshot: { val: () => { id: number; episodes: {}[] } }) => {
        if (snapshot.val() === null) {
          console.log("hook userToWatchShosws No Value")
          setUserToWatchShows([])
          setLoadingNotFinishedShows(false)
          return
        }
        console.log("hook userToWatchShows")
        console.log({ toWatch: snapshot.val() })
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
        console.log({ userEpisodes })
        setUserToWatchShows(userEpisodes)
        setLoadingNotFinishedShows(false)
      })
  }

  const resetStateToWatchShows = () => {
    setUserToWatchShows([])
  }

  return {
    userToWatchShows,
    loadingNotFinishedShows,
    listenerUserToWatchShow,
    resetStateToWatchShows
  }
}

export default useGetUserToWatchShows
