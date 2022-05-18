import { useContext, useEffect, useState } from "react"
import { FirebaseContext } from "Components/Firebase"
import { SeasonEpisodesFromDatabaseInterface } from "../UseUserShows"
import { releasedEpisodesToOneArray } from "Utils"
import { useAppSelector } from "app/hooks"
import { selectAuthUser } from "Components/UserAuth/Session/WithAuthentication/authUserSlice"
import { AuthUserInterface } from "Components/UserAuth/Session/WithAuthentication/@Types"
import useFrequentVariables from "Utils/Hooks/UseFrequentVariables"

type Hook = () => {
  userToWatchShows: UserToWatchShowsInterface[]
  loadingNotFinishedShows: boolean
  listenerUserToWatchShow: ({ uid }: AuthUserInterface["authUser"]) => void
  resetStateToWatchShows: () => void
}

export interface UserToWatchShowsInterface {
  id: number
  episodes: SeasonEpisodesFromDatabaseInterface[]
}

export interface UserToWatchTest {}

const useGetUserToWatchShows: Hook = () => {
  const { firebase, authUser } = useFrequentVariables()

  const [userToWatchShows, setUserToWatchShows] = useState<UserToWatchShowsInterface[]>([])
  const [loadingNotFinishedShows, setLoadingNotFinishedShows] = useState(false)

  useEffect(() => {
    return () => {
      if (!authUser?.uid) return

      firebase
        .userEpisodes(authUser.uid)
        .orderByChild("info/isAllWatched_database")
        .equalTo("false_watchingShows")
        .off()
    }
  }, [firebase, authUser])

  const listenerUserToWatchShow = ({ uid }: AuthUserInterface["authUser"]) => {
    setLoadingNotFinishedShows(true)
    firebase
      .userEpisodes(uid)
      .orderByChild("info/isAllWatched_database")
      .equalTo("false_watchingShows")
      .on("value", (snapshot: { val: () => { id: number; episodes: {}[] } }) => {
        if (snapshot.val() === null) {
          setUserToWatchShows([])
          setLoadingNotFinishedShows(false)
          return
        }
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
