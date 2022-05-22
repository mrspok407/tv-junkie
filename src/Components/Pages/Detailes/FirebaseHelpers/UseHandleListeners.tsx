import {
  SeasonEpisodesFromDatabaseInterface,
  SingleEpisodeInterface,
} from 'Components/UserContent/UseUserShows/UseUserShows'
import { useState, useEffect } from 'react'
import { releasedEpisodesToOneArray } from 'Utils'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'

export interface HandleListenersArg {
  id: number
  status: string
  handleLoading?: (isLoading: boolean) => void
}

const useHandleListeners = ({ id }: { id: number }) => {
  const { firebase, authUser } = useFrequentVariables()

  const [episodesFromDatabase, setEpisodesFromDatabase] = useState<SeasonEpisodesFromDatabaseInterface[]>([])
  const [releasedEpisodes, setReleasedEpisodes] = useState<SingleEpisodeInterface[]>([])

  const handleListeners = ({ id, status, handleLoading }: HandleListenersArg) => {
    if (status === '-' || !authUser?.uid) return

    const statusDatabase = status === 'Ended' || status === 'Canceled' ? 'ended' : 'ongoing'
    firebase.showEpisodes(id).once('value', (snapshot: { val: () => SeasonEpisodesFromDatabaseInterface[] }) => {
      if (snapshot.val() === null) {
        if (handleLoading) handleLoading(false)
        return
      }

      const releasedEpisodes: SingleEpisodeInterface[] = releasedEpisodesToOneArray({
        data: snapshot.val(),
      })

      firebase
        .userShowAllEpisodes(authUser.uid, id)
        .on('value', (snapshot: { val: () => SeasonEpisodesFromDatabaseInterface[] }) => {
          if (snapshot.val() === null) {
            firebase.userShowAllEpisodes(authUser.uid, id).off()
            if (handleLoading) handleLoading(false)
            return
          }

          const userEpisodes = snapshot.val()
          const allEpisodes = userEpisodes.reduce((acc: SingleEpisodeInterface[], item) => {
            acc.push(...item.episodes.filter((item) => item.air_date !== ''))
            return acc
          }, [])
          const releasedUserEpisodes = allEpisodes.slice(0, releasedEpisodes.length)

          const allEpisodesWatched = !allEpisodes.some((episode) => !episode.watched)
          const releasedEpisodesWatched = !releasedUserEpisodes.some((episode) => !episode.watched)

          const finished = !!(statusDatabase === 'ended' && allEpisodesWatched)

          firebase
            .userShow({ uid: authUser.uid, key: id })
            .child('database')
            .once('value', (snapshot: { val: () => string }) => {
              firebase.userShowAllEpisodesInfo(authUser.uid, id).update({
                allEpisodesWatched: releasedEpisodesWatched,
                finished,
                isAllWatched_database: `${releasedEpisodesWatched}_${snapshot.val()}`,
              })
            })

          firebase
            .userShow({ uid: authUser.uid, key: id })
            .update({ finished, allEpisodesWatched: releasedEpisodesWatched })
          setEpisodesFromDatabase(userEpisodes)
          setReleasedEpisodes(releasedEpisodes)
          if (handleLoading) handleLoading(false)
        })
    })
  }

  useEffect(() => () => {
      setEpisodesFromDatabase([])
      setReleasedEpisodes([])

      if (!authUser?.uid) return
      firebase.userShowAllEpisodes(authUser.uid, id).off()
    }, [id, authUser, firebase])

  return { episodesFromDatabase, releasedEpisodes, handleListeners }
}

export default useHandleListeners
