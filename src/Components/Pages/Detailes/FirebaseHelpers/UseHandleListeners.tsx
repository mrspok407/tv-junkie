import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import { useState, useEffect } from "react"
import { releasedEpisodesToOneArray } from "Utils"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"

export interface HandleListenersArg {
  id: number
  status: string
  handleLoading?: (isLoading: boolean) => void
  firebase: FirebaseInterface
  authUser: AuthUserInterface | null
}

const useHandleListeners = () => {
  const [episodesFromDatabase, setEpisodesFromDatabase] = useState<{}[] | null>()
  const [releasedEpisodes, setReleasedEpisodes] = useState<{}[] | null>()

  const handleListeners = ({ id, status, handleLoading, firebase, authUser }: HandleListenersArg) => {
    if (status === "-" || !authUser) return

    const statusDatabase = status === "Ended" || status === "Canceled" ? "ended" : "ongoing"
    firebase.showEpisodes(id).once("value", (snapshot: any) => {
      if (snapshot.val() === null) {
        if (handleLoading) handleLoading(false)
        console.log("early return showsEpisodes")
        return
      }

      const releasedEpisodes = releasedEpisodesToOneArray({ data: snapshot.val() })

      firebase.userShowAllEpisodes(authUser.uid, id).on("value", (snapshot: any) => {
        if (snapshot.val() === null) {
          if (handleLoading) handleLoading(false)
          return
        }

        console.log("detailes Listener")

        const userEpisodes = snapshot.val()
        const allEpisodes = userEpisodes.reduce((acc: {}[], item: { episodes: {}[] }) => {
          acc.push(...item.episodes)
          return acc
        }, [])

        allEpisodes.splice(releasedEpisodes.length)

        const allEpisodesWatched = !allEpisodes.some((episode: { watched: boolean }) => !episode.watched)
        const finished = statusDatabase === "ended" && allEpisodesWatched ? true : false

        console.log(allEpisodesWatched)
        console.log(statusDatabase)

        firebase
          .userShowAllEpisodesInfo(authUser.uid, id)
          .child("database")
          .once("value", (snapshot: any) => {
            firebase.userShowAllEpisodesInfo(authUser.uid, id).update({
              allEpisodesWatched,
              finished,
              isAllWatched_database: `${allEpisodesWatched}_${snapshot.val()}`
            })
          })

        firebase.userShow({ uid: authUser.uid, key: id }).update({ finished, allEpisodesWatched })

        setEpisodesFromDatabase(userEpisodes)
        setReleasedEpisodes(releasedEpisodes)
        if (handleLoading) handleLoading(false)
      })
    })
  }

  useEffect(() => {
    return () => {
      setEpisodesFromDatabase(null)
      setReleasedEpisodes(null)
    }
  }, [])

  return { episodesFromDatabase, releasedEpisodes, handleListeners } as const
}

export default useHandleListeners
