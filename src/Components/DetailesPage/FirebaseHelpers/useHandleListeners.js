import { useState, useEffect } from "react"
import { releasedEpisodesToOneArray } from "Utils"
import mergeEpisodesWithAirDate from "Utils/mergeEpisodesWithAirDate"

const useHandleListeners = ({ id, authUser, firebase }) => {
  const [episodes, setEpisodes] = useState()
  const [releasedEpisodes, setReleasedEpisodes] = useState()

  const handleListeners = ({ status, handleLoading = () => {} }) => {
    if (!status) return

    const statusDatabase = status === "Ended" || status === "Canceled" ? "ended" : "ongoing"

    firebase.showEpisodes(id).once("value", (snapshot) => {
      if (snapshot.val() === null) {
        handleLoading(false)
        console.log("early return showsEpisodes")
        return
      }

      console.log("handleListeners run")

      const episodesFullData = snapshot.val()
      const releasedEpisodes = releasedEpisodesToOneArray({ data: snapshot.val() })

      firebase.userShowEpisodes(authUser.uid, id).on("value", (snapshot) => {
        if (snapshot.val() === null) {
          handleLoading(false)
          return
        }

        const userEpisodes = snapshot.val().episodes

        const allEpisodes = userEpisodes.reduce((acc, item) => {
          acc.push(...item.episodes)
          return acc
        }, [])

        allEpisodes.splice(releasedEpisodes.length)

        const episodesWithAirDate = mergeEpisodesWithAirDate({
          fullData: episodesFullData,
          userData: userEpisodes,
        })

        const allEpisodesWatched = !allEpisodes.some((episode) => !episode.watched)
        const finished = statusDatabase === "ended" && allEpisodesWatched ? true : false

        firebase.userShowAllEpisodesInfo(authUser.uid, id).update({
          allEpisodesWatched,
          finished,
        })

        firebase.userShow({ uid: authUser.uid, key: id }).update({ finished, allEpisodesWatched })

        firebase
          .userShowAllEpisodesNotFinished(authUser.uid, id)
          .set(
            allEpisodesWatched || snapshot.val().info.database !== "watchingShows"
              ? null
              : episodesWithAirDate
          )

        setEpisodes(userEpisodes)
        setReleasedEpisodes(releasedEpisodes)
        handleLoading(false)
      })
    })
  }

  useEffect(() => {
    return () => {
      if (!authUser) return
      console.log("unmount")

      firebase.userShowEpisodes(authUser.uid, id).off()
      setEpisodes(null)
      setReleasedEpisodes(null)
    }
    // eslint-disable-next-line
  }, [id])

  return [episodes, releasedEpisodes, handleListeners]
}

export default useHandleListeners
