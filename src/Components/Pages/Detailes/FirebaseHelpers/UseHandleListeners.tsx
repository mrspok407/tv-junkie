import { FirebaseContext } from "Components/Firebase/FirebaseContext"
import useAuthUser from "Components/UserAuth/Session/WithAuthentication/UseAuthUser"
import {
  SeasonEpisodesFromDatabaseInterface,
  SingleEpisodeInterface
} from "Components/UserContent/UseUserShows/UseUserShows"
import { useState, useEffect, useRef, useContext } from "react"
import { releasedEpisodesToOneArray } from "Utils"

export interface HandleListenersArg {
  id: number
  status: string
  // firebase: FirebaseInterface
  // authUser: AuthUserInterface | null
  handleLoading?: (isLoading: boolean) => void
}

const useHandleListeners = ({ id }: { id?: number }) => {
  const [episodesFromDatabase, setEpisodesFromDatabase] = useState<SeasonEpisodesFromDatabaseInterface[]>([])
  const [releasedEpisodes, setReleasedEpisodes] = useState<SingleEpisodeInterface[]>([])

  const firebase = useContext(FirebaseContext)
  const authUser = useAuthUser()

  const firebaseListenerRef = useRef()

  // console.log(id)

  const handleListeners = ({ id, status, handleLoading }: HandleListenersArg) => {
    if (status === "-" || !authUser) return
    console.log(id)

    const statusDatabase = status === "Ended" || status === "Canceled" ? "ended" : "ongoing"
    firebase
      .showEpisodes(id)
      .once("value", (snapshot: { val: () => SeasonEpisodesFromDatabaseInterface[] }) => {
        if (snapshot.val() === null) {
          if (handleLoading) handleLoading(false)
          console.log("early return showsEpisodes")
          return
        }

        const releasedEpisodes: SingleEpisodeInterface[] = releasedEpisodesToOneArray({
          data: snapshot.val()
        })

        // console.log({ id })

        firebaseListenerRef.current = firebase.userShowAllEpisodes(authUser.uid, id)

        console.log("useHandleListeners before .on")

        firebase
          .userShowAllEpisodes(authUser.uid, id)
          .on("value", (snapshot: { val: () => SeasonEpisodesFromDatabaseInterface[] }) => {
            if (snapshot.val() === null) {
              if (handleLoading) handleLoading(false)
              return
            }

            console.log("detailes Listener")

            const userEpisodes = snapshot.val()
            const allEpisodes = userEpisodes.reduce((acc: SingleEpisodeInterface[], item) => {
              acc.push(...item.episodes)
              return acc
            }, [])

            allEpisodes.splice(releasedEpisodes.length)

            const allEpisodesWatched = !allEpisodes.some((episode) => !episode.watched)
            const finished = statusDatabase === "ended" && allEpisodesWatched ? true : false

            console.log("handleListener just before firebase")
            console.log(id)
            firebase
              .userShowAllEpisodesInfo(authUser.uid, id)
              .child("database")
              .once("value", (snapshot: { val: () => string }) => {
                console.log("handleListeners in firebase")
                firebase.userShowAllEpisodesInfo(authUser.uid, id).update({
                  allEpisodesWatched,
                  finished,
                  isAllWatched_database: `${allEpisodesWatched}_${snapshot.val()}`
                })
              })

            firebase.userShow({ uid: authUser.uid, key: id }).update({ finished, allEpisodesWatched })

            console.log("userEpisodes in detailesListener:")
            console.log(userEpisodes)

            setEpisodesFromDatabase(userEpisodes)
            setReleasedEpisodes(releasedEpisodes)
            if (handleLoading) handleLoading(false)
          })
      })
  }

  useEffect(() => {
    console.log("useEffect in handleListeners")
    console.log({ episodesFromDatabase })
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAA")
  }, [episodesFromDatabase])

  useEffect(() => {
    console.log("updated")
    return () => {
      console.log("unmounted")
      setEpisodesFromDatabase([])
      setReleasedEpisodes([])

      if (!authUser) return
      firebase.userShowAllEpisodes(authUser.uid, id).off()
    }
  }, [id, authUser, firebase])

  return { episodesFromDatabase, releasedEpisodes, handleListeners }
}

export default useHandleListeners
