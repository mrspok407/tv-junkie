import { useState, useEffect } from "react"
import { combineMergeObjects, releasedEpisodesModifier } from "Utils"
import merge from "deepmerge"

const useHandleListeners = ({ id, authUser, firebase }) => {
  const [loading, setLoading] = useState(false)
  const [episodes, setEpisodes] = useState()
  const [releasedEpisodes, setReleasedEpisodes] = useState()

  const handleListeners = status => {
    if (!authUser) return
    setLoading(true)

    const statusDatabase = status === "Ended" || status === "Canceled" ? "ended" : "ongoing"

    firebase.showEpisodes(statusDatabase, id).on("value", snapshot => {
      if (snapshot.val() === null) {
        setLoading(false)
        return
      }

      const episodesFullData = snapshot.val()
      const releasedEpisodes = releasedEpisodesModifier({ data: snapshot.val() })

      firebase.userShowEpisodes(authUser.uid, id).on("value", snapshot => {
        if (snapshot.val() === null) {
          setLoading(false)
          return
        }

        const userEpisodes = snapshot.val().episodes

        const allEpisodes = userEpisodes.reduce((acc, item) => {
          acc.push(...item.episodes)
          return acc
        }, [])

        allEpisodes.splice(releasedEpisodes.length)

        const episodesAirDate = merge(episodesFullData, userEpisodes, {
          arrayMerge: combineMergeObjects
        }).reduce((acc, season) => {
          const episodes = season.episodes.reduce((acc, episode) => {
            acc.push({
              air_date: episode.air_date || null,
              userRating: episode.userRating,
              watched: episode.watched
            })
            return acc
          }, [])
          acc.push({
            season_number: season.season_number,
            userRating: season.userRating,
            episodes
          })
          return acc
        }, [])

        const allEpisodesWatched = !allEpisodes.some(episode => !episode.watched)
        const finished = statusDatabase === "ended" && allEpisodesWatched ? true : false

        firebase.userShowAllEpisodesInfo(authUser.uid, id).update({
          allEpisodesWatched,
          finished
        })
        firebase.userShow({ uid: authUser.uid, key: id }).update({ finished, allEpisodesWatched })
        firebase
          .userShowAllEpisodesNotFinished(authUser.uid, id)
          .set(
            allEpisodesWatched || snapshot.val().info.database !== "watchingShows" ? null : episodesAirDate
          )

        setEpisodes(userEpisodes)
        setReleasedEpisodes(releasedEpisodes)
        setLoading(false)
      })
    })
  }

  useEffect(() => {
    return () => {
      firebase.userShowEpisodes(authUser.uid, id).off()
      firebase.showEpisodes("ended", id).off()
      firebase.showEpisodes("ongoing", id).off()
      setEpisodes(null)
      setReleasedEpisodes(null)
    }
  }, [authUser.uid, firebase, id])

  return [loading, episodes, releasedEpisodes, handleListeners]
}

export default useHandleListeners
