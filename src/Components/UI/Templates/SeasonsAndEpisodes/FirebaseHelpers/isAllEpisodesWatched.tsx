import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import {
  SeasonEpisodesFromDatabaseInterface,
  SingleEpisodeInterface
} from "Components/UserContent/UseUserShows/UseUserShows"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"
import { differenceBtwDatesInDays, todayDate } from "Utils"
import { ContentDetailes } from "Utils/Interfaces/ContentDetails"

interface Arguments {
  showInfo: ContentDetailes
  releasedEpisodes: SingleEpisodeInterface[]
  episodesFromDatabase: SeasonEpisodesFromDatabaseInterface[]
  authUser: AuthUserInterface
  firebase: FirebaseInterface
  isSingleEpisode?: boolean
  multipleEpisodes?: number
}

const isAllEpisodesWatched = ({
  showInfo,
  releasedEpisodes,
  episodesFromDatabase,
  authUser,
  firebase,
  isSingleEpisode,
  multipleEpisodes
}: Arguments) => {
  const status = showInfo.status === "Ended" || showInfo.status === "Canceled" ? "ended" : "ongoing"
  const allEpisodes = episodesFromDatabase.reduce((acc: SingleEpisodeInterface[], item) => {
    acc.push(...item.episodes.filter((item) => item.air_date !== ""))
    return acc
  }, [])

  const allEpisodesWatched = isSingleEpisode
    ? allEpisodes.filter((episode) => !episode.watched).length === 1
    : multipleEpisodes
    ? allEpisodes.filter((episode) => !episode.watched).length === multipleEpisodes
    : allEpisodes
        .map((episode) => episode.season_number)
        .filter((episode, index, array) => array.indexOf(episode) === index).length === 1 &&
      !allEpisodes.some((episode) => !episode.watched)

  const releasedEpisodesWatched = isSingleEpisode
    ? releasedEpisodes.filter((episode) => !episode.watched).length === 1
    : multipleEpisodes
    ? releasedEpisodes.filter((episode) => !episode.watched).length === multipleEpisodes
    : releasedEpisodes
        .map((episode) => episode.season_number)
        .filter((episode, index, array) => array.indexOf(episode) === index).length === 1

  const isAllEpisodesAired = allEpisodes.some((episode) => {
    const daysToNewEpisode = differenceBtwDatesInDays(episode.air_date, todayDate)
    return daysToNewEpisode > 0
  })
    ? allEpisodesWatched
    : releasedEpisodesWatched

  const finished = (status === "ended" || showInfo.status === "ended") && isAllEpisodesAired ? true : false

  if (releasedEpisodesWatched) {
    firebase.userShowAllEpisodesInfo(authUser.uid, showInfo.id).update({
      allEpisodesWatched: releasedEpisodesWatched,
      finished,
      isAllWatched_database: `${releasedEpisodesWatched}_${showInfo.database}`
    })

    firebase
      .userShow({ uid: authUser.uid, key: showInfo.id })
      .update({ finished, allEpisodesWatched: releasedEpisodesWatched })
  }
}

export default isAllEpisodesWatched
