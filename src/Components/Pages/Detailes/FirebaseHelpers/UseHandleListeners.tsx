import { AppContext } from "Components/AppContext/AppContextHOC"
import { useState, useEffect, useContext } from "react"
import { releasedEpisodesToOneArray } from "Utils"

interface Props {
  id: number
}

export interface HandleListenersArg {
  status: string
  handleLoading?: (isLoading: boolean) => void
}

const useHandleListeners = ({ id }: Props) => {
  const { firebase, authUser } = useContext(AppContext)
  const [episodesFromDatabase, setEpisodesFromDatabase] = useState<{}[] | null>()
  const [releasedEpisodes, setReleasedEpisodes] = useState<{}[] | null>()

  const handleListeners = ({ status, handleLoading }: HandleListenersArg) => {
    if (status === "-") return

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
      if (!authUser) return
      firebase.userShowAllEpisodes(authUser.uid, id).off()
      setEpisodesFromDatabase(null)
      setReleasedEpisodes(null)
    }
    // eslint-disable-next-line
  }, [id])

  return { episodesFromDatabase, releasedEpisodes, handleListeners } as const
}

export default useHandleListeners
